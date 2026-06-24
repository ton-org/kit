#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Custom JSON Schema generator that preserves enum member names.
 * Uses ts-json-schema-generator with custom EnumType and formatter.
 */

const fs = require('fs');
const path = require('path');

const tsj = require('ts-json-schema-generator');
const ts = require('typescript');

// ============================================================================
// Constants
// ============================================================================

const INTEGER_FORMATS = [
    'int',
    'int8',
    'int16',
    'int32',
    'int64',
    'uint',
    'uint8',
    'uint16',
    'uint32',
    'uint64',
    'timestamp',
];

// ============================================================================
// Custom EnumType with Member Names
// ============================================================================

/**
 * Extended EnumType that stores member names alongside values.
 */
class EnumTypeWithNames extends tsj.EnumType {
    constructor(id, values, memberNames, annotations = {}) {
        super(id, values);
        this.memberNames = memberNames;
        this.annotations = annotations;
    }

    getMemberNames() {
        return this.memberNames;
    }

    getAnnotations() {
        return this.annotations;
    }
}

// ============================================================================
// Custom EnumNodeParser
// ============================================================================

/**
 * Custom parser that extracts enum member names and JSDoc annotations.
 * Wraps enums in DefinitionType so they become separate schema definitions.
 */
class EnumNodeParserWithNames {
    constructor(typeChecker) {
        this.typeChecker = typeChecker;
    }

    supportsNode(node) {
        return node.kind === ts.SyntaxKind.EnumDeclaration;
    }

    createType(node) {
        const members = [...node.members];

        const values = [];
        const memberNames = [];

        // Extract JSDoc annotations from the enum declaration
        const annotations = this.extractAnnotations(node);

        members.forEach((member, index) => {
            // Skip hidden members
            const jsDoc = ts.getJSDocTags(member);
            const isHidden = jsDoc.some((tag) => tag.tagName.text === 'hidden' || tag.tagName.text === 'ignore');
            if (isHidden) return;

            // Get member name
            const name = member.name.getText();
            memberNames.push(name);

            // Get member value
            const constantValue = this.typeChecker.getConstantValue(member);
            if (constantValue !== undefined) {
                values.push(constantValue);
            } else if (member.initializer) {
                values.push(this.parseInitializer(member.initializer));
            } else {
                values.push(index);
            }
        });

        // Create unique ID for this enum
        const sourceFile = node.getSourceFile();
        const id = `enum-${sourceFile.fileName}-${node.pos}`;

        const enumType = new EnumTypeWithNames(id, values, memberNames, annotations);

        // Get the enum name for the definition
        const enumName = node.name.getText();

        // Wrap in DefinitionType so it becomes a separate schema definition
        return new tsj.DefinitionType(enumName, enumType);
    }

    /**
     * Extract JSDoc annotations from a node.
     * Passes through all JSDoc tags as schema properties.
     */
    extractAnnotations(node) {
        const annotations = {};
        const jsDocTags = ts.getJSDocTags(node);

        for (const tag of jsDocTags) {
            const tagName = tag.tagName.text;

            // Skip internal tags
            if (['hidden', 'ignore', 'internal', 'private'].includes(tagName)) {
                continue;
            }

            // Extract tag value
            let tagValue;
            if (tag.comment) {
                tagValue =
                    typeof tag.comment === 'string'
                        ? tag.comment.trim()
                        : tag.comment
                              .map((c) => c.text)
                              .join('')
                              .trim();
            } else {
                tagValue = true; // Boolean flag (e.g., @deprecated)
            }

            // Handle array-type annotations (multiple @example tags)
            if (tagName === 'example') {
                annotations.examples = annotations.examples || [];
                annotations.examples.push(tagValue);
            } else {
                annotations[tagName] = tagValue;
            }
        }

        // Get main JSDoc comment as description if not already set
        if (!annotations.description) {
            const jsDocComments = ts.getJSDocCommentsAndTags(node);
            const mainComment = jsDocComments.find((c) => ts.isJSDoc(c));
            if (mainComment && mainComment.comment) {
                annotations.description =
                    typeof mainComment.comment === 'string'
                        ? mainComment.comment.trim()
                        : mainComment.comment
                              .map((c) => c.text)
                              .join('')
                              .trim();
            }
        }

        return annotations;
    }

    parseInitializer(initializer) {
        switch (initializer.kind) {
            case ts.SyntaxKind.TrueKeyword:
                return true;
            case ts.SyntaxKind.FalseKeyword:
                return false;
            case ts.SyntaxKind.NullKeyword:
                return null;
            case ts.SyntaxKind.StringLiteral:
                return initializer.text;
            case ts.SyntaxKind.NumericLiteral:
                return Number(initializer.text);
            case ts.SyntaxKind.PrefixUnaryExpression:
                if (initializer.operator === ts.SyntaxKind.MinusToken) {
                    return -this.parseInitializer(initializer.operand);
                }
                return initializer.getText();
            case ts.SyntaxKind.ParenthesizedExpression:
                return this.parseInitializer(initializer.expression);
            default:
                return initializer.getText();
        }
    }
}

// ============================================================================
// Const-Object Enum Parser
// ============================================================================

/**
 * Parser for const-object enum patterns:
 *   export const X = { A: 'A', B: 'B' } as const;
 *   export type XValue = (typeof X)[keyof typeof X];
 *
 * Detects the indexed access type pattern and extracts enum members
 * from the referenced const object declaration.
 */
class ConstEnumNodeParser {
    constructor(typeChecker) {
        this.typeChecker = typeChecker;
    }

    /**
     * Unwrap ParenthesizedType to get the inner type node.
     */
    unwrapParens(typeNode) {
        while (typeNode.kind === ts.SyntaxKind.ParenthesizedType) {
            typeNode = typeNode.type;
        }
        return typeNode;
    }

    supportsNode(node) {
        // Match: type X = (typeof Y)[keyof typeof Y]
        if (node.kind !== ts.SyntaxKind.TypeAliasDeclaration) return false;

        const typeNode = node.type;
        if (!typeNode || typeNode.kind !== ts.SyntaxKind.IndexedAccessType) return false;

        // objectType must be TypeQuery (typeof Y), possibly wrapped in parens
        const objectType = this.unwrapParens(typeNode.objectType);
        if (objectType.kind !== ts.SyntaxKind.TypeQuery) return false;

        // indexType must be TypeOperator with keyof
        if (typeNode.indexType.kind !== ts.SyntaxKind.TypeOperator) return false;
        if (typeNode.indexType.operator !== ts.SyntaxKind.KeyOfKeyword) return false;

        // Verify the const object can be found
        const constName = objectType.exprName.getText();
        const sourceFile = node.getSourceFile();
        return this.findConstObjectDeclaration(sourceFile, constName) !== null;
    }

    createType(node) {
        const typeAliasName = node.name.getText();
        const objectType = this.unwrapParens(node.type.objectType);
        const constName = objectType.exprName.getText();
        const sourceFile = node.getSourceFile();
        const constDecl = this.findConstObjectDeclaration(sourceFile, constName);

        const { values, memberNames } = this.extractMembers(constDecl, constName);

        // Use x-definition-name to rename the definition to the const object name in post-processing
        const annotations = typeAliasName !== constName ? { 'x-definition-name': constName } : {};

        const id = `const-enum-${sourceFile.fileName}-${node.pos}`;
        const enumType = new EnumTypeWithNames(id, values, memberNames, annotations);

        return new tsj.DefinitionType(typeAliasName, enumType);
    }

    extractMembers(constDecl, constName) {
        // Derive prefix from const name: SettlementMethod → SETTLEMENT_METHOD_
        const prefix = this.toScreamingSnake(constName) + '_';

        const values = [];
        const memberNames = [];
        const objLiteral = constDecl.initializer;

        for (const prop of objLiteral.properties) {
            if (prop.kind !== ts.SyntaxKind.PropertyAssignment) continue;

            const key = prop.name.getText();
            const value = this.resolveValue(prop);
            values.push(value);

            // Strip prefix from key for the varname, then camelCase
            const stripped = key.startsWith(prefix) ? key.slice(prefix.length) : key;
            memberNames.push(this.toCamelCase(stripped));
        }

        return { values, memberNames };
    }

    resolveValue(prop) {
        const init = prop.initializer;
        if (init.kind === ts.SyntaxKind.StringLiteral) return init.text;
        if (init.kind === ts.SyntaxKind.NumericLiteral) return Number(init.text);
        // Identifier reference — resolve via type checker
        if (init.kind === ts.SyntaxKind.Identifier) {
            const symbol = this.typeChecker.getSymbolAtLocation(init);
            const decl = symbol?.valueDeclaration;
            if (decl?.initializer?.kind === ts.SyntaxKind.StringLiteral) {
                return decl.initializer.text;
            }
            if (decl?.initializer?.kind === ts.SyntaxKind.NumericLiteral) {
                return Number(decl.initializer.text);
            }
        }
        return init.getText();
    }

    /**
     * Find a const variable declaration with an object literal initializer.
     */
    findConstObjectDeclaration(sourceFile, name) {
        for (const stmt of sourceFile.statements) {
            if (stmt.kind !== ts.SyntaxKind.VariableStatement) continue;
            for (const decl of stmt.declarationList.declarations) {
                if (decl.name.getText() !== name) continue;
                // Accept ObjectLiteralExpression or AsExpression wrapping one
                let init = decl.initializer;
                if (init?.kind === ts.SyntaxKind.AsExpression) {
                    init = init.expression;
                }
                if (init?.kind === ts.SyntaxKind.ObjectLiteralExpression) {
                    return { ...decl, initializer: init };
                }
            }
        }
        return null;
    }

    toScreamingSnake(str) {
        return str
            .replace(/([A-Z])/g, '_$1')
            .toUpperCase()
            .replace(/^_/, '');
    }

    toCamelCase(str) {
        if (str.includes('_')) {
            return str.toLowerCase().replace(/_([a-z])/g, (_, l) => l.toUpperCase());
        }
        if (str === str.toUpperCase()) return str.toLowerCase();
        return str.charAt(0).toLowerCase() + str.slice(1);
    }
}

// ============================================================================
// Custom EnumTypeFormatter with x-enum-varnames
// ============================================================================

/**
 * Custom formatter that adds x-enum-varnames and JSDoc annotations to enum schemas.
 */
class EnumTypeFormatterWithVarnames {
    supportsType(type) {
        return type instanceof tsj.EnumType;
    }

    getDefinition(type) {
        const values = [...new Set(type.getValues())];
        const types = [...new Set(values.map((v) => this.getTypeName(v)))];

        const definition =
            values.length === 1
                ? { type: types[0], const: values[0] }
                : { type: types.length === 1 ? types[0] : types, enum: values };

        // Add x-enum-varnames if we have member names
        if (type instanceof EnumTypeWithNames) {
            const memberNames = type.getMemberNames();
            if (memberNames && memberNames.length === values.length) {
                definition['x-enum-varnames'] = memberNames.map((name) => this.toCamelCase(name));
            }

            // Add JSDoc annotations (format, description, etc.)
            const annotations = type.getAnnotations();
            if (annotations) {
                for (const [key, value] of Object.entries(annotations)) {
                    if (value !== undefined && value !== null) {
                        definition[key] = value;
                    }
                }
            }

            // Fix integer type based on format annotation
            if (definition.type === 'number' && definition.format && INTEGER_FORMATS.includes(definition.format)) {
                definition.type = 'integer';
            }
        }

        return definition;
    }

    getChildren() {
        return [];
    }

    getTypeName(value) {
        if (value === null) return 'null';
        if (typeof value === 'string') return 'string';
        if (typeof value === 'number') return 'number';
        if (typeof value === 'boolean') return 'boolean';
        return 'string';
    }

    toCamelCase(str) {
        // Convert SCREAMING_SNAKE_CASE to camelCase
        if (str.includes('_')) {
            return str.toLowerCase().replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        }
        // Convert ALLCAPS to lowercase
        if (str === str.toUpperCase()) {
            return str.toLowerCase();
        }
        // Convert PascalCase to camelCase
        return str.charAt(0).toLowerCase() + str.slice(1);
    }
}

// ============================================================================
// Custom AnnotatedTypeFormatter with Integer Type Support
// ============================================================================

/**
 * Extends AnnotatedTypeFormatter to fix integer types after annotations are merged.
 * Converts { type: "number", format: "int32" } → { type: "integer", format: "int32" }
 */
class AnnotatedTypeFormatterWithIntegers extends tsj.AnnotatedTypeFormatter {
    getDefinition(type) {
        const def = super.getDefinition(type);

        // Handle frozen format — strip original type completely
        if (def.format === 'frozen') {
            const frozenDef = { type: 'object', 'x-frozen': true };
            if (def.description) frozenDef.description = def.description;
            return frozenDef;
        }

        // Fix number type with integer format
        if (def.type === 'number' && def.format && INTEGER_FORMATS.includes(def.format)) {
            def.type = 'integer';
        }

        return def;
    }

    getChildren(type) {
        // Don't generate child types for frozen fields
        const annotations = type.getAnnotations ? type.getAnnotations() : {};
        if (annotations.format === 'frozen') {
            return [];
        }
        return super.getChildren(type);
    }
}

// ============================================================================
// Discriminated Union Types
// ============================================================================

/**
 * Synthetic type for primitive values in discriminated unions.
 */
class SyntheticValueType extends tsj.BaseType {
    constructor(name, innerType, caseName, rawValue, isIndirect = false) {
        super();
        this.name = name;
        this.innerType = innerType;
        this.caseName = caseName;
        this.rawValue = rawValue;
        // True when the synthetic value recursively references the parent
        // union *directly* (not wrapped in an array). Carried as a vendor
        // extension so Swift can emit `indirect case` on that arm.
        this.isIndirect = isIndirect;
    }

    getId() {
        return `synthetic-${this.name}`;
    }

    getName() {
        return this.name;
    }

    getInnerType() {
        return this.innerType;
    }

    getCaseName() {
        return this.caseName;
    }

    getRawValue() {
        return this.rawValue;
    }

    getIsIndirect() {
        return this.isIndirect;
    }
}

/**
 * Wrapper for discriminated unions that carries synthetic value types.
 */
class DiscriminatedUnionType extends tsj.BaseType {
    constructor(parentName, innerUnion, syntheticTypes, caseValueRefs) {
        super();
        this.parentName = parentName;
        this.innerUnion = innerUnion;
        this.syntheticTypes = syntheticTypes;
        this.caseValueRefs = caseValueRefs;
    }

    getId() {
        return this.innerUnion.getId();
    }

    getParentName() {
        return this.parentName;
    }

    getInnerUnion() {
        return this.innerUnion;
    }

    getSyntheticTypes() {
        return this.syntheticTypes;
    }

    getCaseValueRefs() {
        return this.caseValueRefs;
    }
}

// ============================================================================
// Discriminated Union Parser
// ============================================================================

/**
 * Parser for type aliases that contain discriminated unions.
 */
class DiscriminatedUnionNodeParser {
    constructor(typeChecker, childNodeParser) {
        this.typeChecker = typeChecker;
        this.childNodeParser = childNodeParser;
    }

    supportsNode(node) {
        if (node.kind !== ts.SyntaxKind.TypeAliasDeclaration) {
            return false;
        }

        const typeNode = node.type;
        if (!typeNode || typeNode.kind !== ts.SyntaxKind.UnionType || typeNode.types.length < 2) {
            return false;
        }

        const isDiscriminated = typeNode.types.every((member) => this.isDiscriminatedMember(member));
        if (!isDiscriminated) {
            return false;
        }

        return true;
    }

    /**
     * Check if any union member has a value property that references the parent type
     */
    hasRecursiveReference(unionNode, parentTypeName) {
        for (const member of unionNode.types) {
            if (member.kind !== ts.SyntaxKind.TypeLiteral) continue;

            for (const prop of member.members) {
                if (prop.kind !== ts.SyntaxKind.PropertySignature) continue;
                if (!prop.type) continue;

                if (this.typeReferencesName(prop.type, parentTypeName)) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Check if a type node references a given type name (directly or in arrays)
     */
    typeReferencesName(typeNode, name) {
        // Direct type reference
        if (typeNode.kind === ts.SyntaxKind.TypeReference) {
            const typeName = typeNode.typeName?.getText();
            if (typeName === name) {
                return true;
            }
        }
        // Array type (e.g., RawStackItem[])
        if (typeNode.kind === ts.SyntaxKind.ArrayType) {
            return this.typeReferencesName(typeNode.elementType, name);
        }
        // Union type
        if (typeNode.kind === ts.SyntaxKind.UnionType) {
            return typeNode.types.some((t) => this.typeReferencesName(t, name));
        }
        return false;
    }

    isDiscriminatedMember(typeNode) {
        if (typeNode.kind !== ts.SyntaxKind.TypeLiteral) {
            return false;
        }

        return typeNode.members.some(
            (member) =>
                member.kind === ts.SyntaxKind.PropertySignature &&
                member.name?.getText() === 'type' &&
                member.type?.kind === ts.SyntaxKind.LiteralType,
        );
    }

    createType(node, context) {
        const typeName = node.name.getText();
        const typeNode = node.type;
        const unionType = this.childNodeParser.createType(typeNode, context);

        const syntheticTypes = [];
        const caseValueRefs = new Map();

        for (const memberNode of typeNode.types) {
            const rawValue = this.getDiscriminatorValue(memberNode);
            if (rawValue === null) continue;

            const valuePropNode = this.findPropertyNode(memberNode, 'value');
            if (!valuePropNode?.type || !this.isPrimitiveType(valuePropNode.type)) continue;

            // Check if this is a recursive reference (e.g., RawStackItem[] in RawStackItem)
            const isRecursive = this.typeReferencesName(valuePropNode.type, typeName);
            const isArrayRecursion = isRecursive && valuePropNode.type.kind === ts.SyntaxKind.ArrayType;
            const isDirectRecursion = isRecursive && !isArrayRecursion;

            let valueType;
            if (isArrayRecursion) {
                // value: Parent[] — array of self. Swift array boxes the
                // element so no `indirect` is needed.
                valueType = new tsj.ArrayType(new tsj.DefinitionType(typeName, new tsj.AnyType()));
            } else if (isDirectRecursion) {
                // value: Parent — bare self-reference. Synthesize a $ref
                // back to the parent; the case must be emitted as
                // `indirect case` in Swift to permit the cycle.
                valueType = new tsj.DefinitionType(typeName, new tsj.AnyType());
            } else {
                valueType = this.childNodeParser.createType(valuePropNode.type, context);
            }

            const capitalizedValue = String(rawValue).charAt(0).toUpperCase() + String(rawValue).slice(1);
            const syntheticName = `${typeName}${capitalizedValue}Value`;
            const caseName = this.toCamelCase(String(rawValue));

            const syntheticType = new SyntheticValueType(
                syntheticName,
                valueType,
                caseName,
                rawValue,
                isDirectRecursion,
            );
            syntheticTypes.push({
                definitionType: new tsj.DefinitionType(syntheticName, syntheticType),
                rawValue,
                refName: syntheticName,
            });
            caseValueRefs.set(rawValue, syntheticName);
        }

        const resultType =
            syntheticTypes.length > 0
                ? new DiscriminatedUnionType(typeName, unionType, syntheticTypes, caseValueRefs)
                : unionType;

        return new tsj.DefinitionType(typeName, resultType);
    }

    getDiscriminatorValue(typeNode) {
        const typeProp = this.findPropertyNode(typeNode, 'type');
        if (typeProp?.type?.kind === ts.SyntaxKind.LiteralType) {
            const literal = typeProp.type.literal;
            if (literal.kind === ts.SyntaxKind.StringLiteral) {
                return literal.text;
            }
        }
        return null;
    }

    findPropertyNode(typeNode, propName) {
        return typeNode.members.find(
            (m) => m.kind === ts.SyntaxKind.PropertySignature && m.name?.getText() === propName,
        );
    }

    isPrimitiveType(typeNode) {
        const primitiveKinds = [
            ts.SyntaxKind.StringKeyword,
            ts.SyntaxKind.NumberKeyword,
            ts.SyntaxKind.BooleanKeyword,
            ts.SyntaxKind.UnknownKeyword,
            ts.SyntaxKind.AnyKeyword,
        ];
        if (primitiveKinds.includes(typeNode.kind)) {
            return true;
        }
        // Handle all array types including recursive ones like RawStackItem[]
        // Swift can handle indirect enums with recursive associated values
        if (typeNode.kind === ts.SyntaxKind.ArrayType) {
            return true;
        }
        // Handle type references (e.g., SomeOtherType)
        if (typeNode.kind === ts.SyntaxKind.TypeReference) {
            return true;
        }
        if (typeNode.kind === ts.SyntaxKind.TypeLiteral) {
            const members = typeNode.members;
            return members.length === 1 && members[0].kind === ts.SyntaxKind.IndexSignature;
        }
        return false;
    }

    toCamelCase(str) {
        if (str.includes('_')) {
            return str.toLowerCase().replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        }
        return str;
    }
}

// ============================================================================
// Discriminated Union Formatters
// ============================================================================

/**
 * Formatter for synthetic value types.
 */
class SyntheticValueTypeFormatter {
    constructor(childTypeFormatter) {
        this.childTypeFormatter = childTypeFormatter;
    }

    supportsType(type) {
        return type instanceof SyntheticValueType;
    }

    getDefinition(type) {
        const innerDef = this.childTypeFormatter.getDefinition(type.getInnerType());
        return {
            ...innerDef,
            'x-enum-case-name': type.getCaseName(),
            'x-enum-case-raw-value': type.getRawValue(),
        };
    }

    getChildren(type) {
        return this.childTypeFormatter.getChildren(type.getInnerType());
    }
}

/**
 * Formatter for discriminated unions with Swift-compatible extensions.
 */
class DiscriminatedUnionTypeFormatter {
    constructor(childTypeFormatter) {
        this.childTypeFormatter = childTypeFormatter;
        this.currentTypeName = null;
    }

    supportsType(type) {
        // Only claim DiscriminatedUnionType (the wrapped form we synthesise
        // ourselves). Inline anonymous unions like
        // `{type:'a'; ...} | {type:'b'; ...}` inside a property are deferred
        // to the default UnionTypeFormatter, which produces the canonical
        // `allOf + if/then` shape. `postProcessDiscriminatedUnions` then
        // reshapes them while preserving every variant field instead of
        // collapsing on `value`.
        return type instanceof DiscriminatedUnionType;
    }

    /**
     * Check if any union variant has a value property that is an array type
     * Arrays in value properties of discriminated unions cause issues with Swift generators
     */
    hasRecursiveReference() {
        // Don't skip any discriminated unions - Swift can handle recursive enums with `indirect`
        return false;
    }

    getDiscriminatorValue(type) {
        const derefed = this.derefType(type);
        if (derefed instanceof tsj.ObjectType) {
            const typeProp = derefed.getProperties().find((p) => p.getName() === 'type');
            if (typeProp) {
                const propType = this.derefType(typeProp.getType());
                if (propType instanceof tsj.LiteralType) {
                    return propType.getValue();
                }
            }
        }
        return null;
    }

    getAssociatedValueType(type) {
        const derefed = this.derefType(type);
        if (derefed instanceof tsj.ObjectType) {
            const valueProp = derefed.getProperties().find((p) => p.getName() === 'value');
            return valueProp?.getType() ?? null;
        }
        return null;
    }

    derefType(type) {
        if (type instanceof tsj.DefinitionType) {
            return this.derefType(type.getType());
        }
        if (type instanceof tsj.AnnotatedType) {
            return this.derefType(type.getType());
        }
        return type;
    }

    getDefinition(type) {
        const union = type instanceof DiscriminatedUnionType ? type.getInnerUnion() : type;
        const caseValueRefs = type instanceof DiscriminatedUnionType ? type.getCaseValueRefs() : new Map();
        const syntheticTypes = type instanceof DiscriminatedUnionType ? type.getSyntheticTypes() : [];

        const enumCases = [];
        const valueProperties = {};
        const discriminatorValues = [];

        for (const variant of union.getTypes()) {
            const typeValue = this.getDiscriminatorValue(variant);
            if (typeValue === null) continue;

            discriminatorValues.push(typeValue);
            const camelCaseName = this.toCamelCase(String(typeValue));
            const caseInfo = { name: camelCaseName, rawValue: typeValue, hasAssociatedValue: false };

            const valueType = this.getAssociatedValueType(variant);
            if (valueType) {
                caseInfo.hasAssociatedValue = true;
                const propName = `x_${typeValue}_value`;
                caseInfo.valuePropertyName = propName;

                const syntheticRef = caseValueRefs.get(typeValue);
                const valueDef = syntheticRef
                    ? { $ref: `#/components/schemas/${syntheticRef}` }
                    : this.childTypeFormatter.getDefinition(valueType);

                const caseProp = {
                    allOf: [valueDef.$ref ? { $ref: valueDef.$ref } : valueDef],
                    'x-enum-case-name': camelCaseName,
                    'x-enum-case-raw-value': typeValue,
                };

                // Propagate `indirect` from the synthetic value type so the
                // Swift template can emit `indirect case` for direct
                // (non-array) self-references.
                const synth = syntheticTypes.find((s) => s.rawValue === typeValue);
                if (synth && synth.definitionType.getType().getIsIndirect?.()) {
                    caseProp['x-indirect'] = true;
                    caseInfo.indirect = true;
                }

                valueProperties[propName] = caseProp;
            }

            enumCases.push(caseInfo);
        }

        return {
            type: 'object',
            properties: {
                type: { type: 'string', enum: discriminatorValues },
                ...valueProperties,
            },
            'x-discriminated-union': true,
            'x-enum-cases': enumCases,
        };
    }

    getChildren(type) {
        const children = [];
        if (type instanceof DiscriminatedUnionType) {
            for (const synth of type.getSyntheticTypes()) {
                children.push(synth.definitionType);
            }
        }
        const union = type instanceof DiscriminatedUnionType ? type.getInnerUnion() : type;
        for (const variant of union.getTypes()) {
            const valueType = this.getAssociatedValueType(variant);
            if (valueType) {
                children.push(...this.childTypeFormatter.getChildren(valueType));
            }
        }
        return children;
    }

    toCamelCase(str) {
        if (str.includes('_')) {
            return str.toLowerCase().replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        }
        return str;
    }
}

// ============================================================================
// Generic Interface Types
// ============================================================================

/**
 * Type for generic interfaces that carries type parameter metadata.
 * Used to preserve generic type parameters through the schema generation pipeline.
 */
class GenericInterfaceType extends tsj.BaseType {
    constructor(name, innerType, typeParameters) {
        super();
        this.name = name;
        this.innerType = innerType;
        this.typeParameters = typeParameters; // Array of {name, constraint?, default?}
    }

    getId() {
        return `generic-${this.name}`;
    }

    getName() {
        return this.name;
    }

    getInnerType() {
        return this.innerType;
    }

    getTypeParameters() {
        return this.typeParameters;
    }
}

// ============================================================================
// Generic Interface Parser
// ============================================================================

/**
 * Parser for interface declarations with type parameters.
 * Detects generic interfaces and preserves type parameter information.
 */
class GenericInterfaceNodeParser {
    constructor(typeChecker, childNodeParser) {
        this.typeChecker = typeChecker;
        this.childNodeParser = childNodeParser;
    }

    supportsNode(node) {
        return (
            node.kind === ts.SyntaxKind.InterfaceDeclaration && node.typeParameters && node.typeParameters.length > 0
        );
    }

    createType(node, context) {
        const interfaceName = node.name.getText();

        // Extract type parameters with their constraints and defaults
        const typeParameters = node.typeParameters.map((param) => {
            const paramInfo = {
                name: param.name.getText(),
            };

            // Extract constraint (e.g., <T extends SomeType>)
            if (param.constraint) {
                paramInfo.constraint = param.constraint.getText();
            }

            // Extract default (e.g., <T = DefaultType>)
            if (param.default) {
                paramInfo.default = param.default.getText();
            }

            return paramInfo;
        });

        // Create a set of type parameter names for reference detection
        const typeParamNames = new Set(typeParameters.map((p) => p.name));

        // Parse the interface members manually to handle generic type references
        const properties = [];
        for (const member of node.members) {
            if (member.kind === ts.SyntaxKind.PropertySignature) {
                const propName = member.name.getText();
                const isOptional = !!member.questionToken;

                // Check if the property type references a generic type parameter
                let propType;
                let genericTypeRef = null;
                let genericInstanceType = null;

                if (member.type) {
                    const typeText = member.type.getText();
                    if (typeParamNames.has(typeText)) {
                        // Property uses a generic type parameter directly
                        genericTypeRef = typeText;
                        propType = new tsj.AnyType(); // Placeholder
                    } else {
                        // Parse the type normally
                        propType = this.childNodeParser.createType(member.type, context);

                        // Detect a generic instantiation parameterized by the parent's own type
                        // params, e.g. `CryptoOnrampQuote<TQuoteMetadata>`. JSON Schema can't carry
                        // the type argument (it collapses to a $ref to the base), so capture the
                        // unprefixed Swift type text and let the template re-attach it. Restricted
                        // to the case where every argument is one of this interface's type params,
                        // so none of them need the model-name prefix.
                        if (
                            ts.isTypeReferenceNode(member.type) &&
                            member.type.typeArguments &&
                            member.type.typeArguments.length > 0 &&
                            member.type.typeArguments.every((arg) => typeParamNames.has(arg.getText()))
                        ) {
                            const baseName = member.type.typeName.getText();
                            const argList = member.type.typeArguments.map((arg) => arg.getText()).join(', ');
                            genericInstanceType = `${baseName}<${argList}>`;
                        }
                    }
                } else {
                    propType = new tsj.AnyType();
                }

                // Extract JSDoc description
                let description;
                const jsDocComments = ts.getJSDocCommentsAndTags(member);
                const mainComment = jsDocComments.find((c) => ts.isJSDoc(c));
                if (mainComment && mainComment.comment) {
                    description =
                        typeof mainComment.comment === 'string'
                            ? mainComment.comment.trim()
                            : mainComment.comment
                                  .map((c) => c.text)
                                  .join('')
                                  .trim();
                }

                // Extract @format JSDoc tag (e.g. `@format int32`, `@format frozen`).
                // Without this the format never reaches the schema because
                // childNodeParser.createType only sees `member.type` (a bare
                // TypeNode) and not the surrounding JSDoc.
                let format;
                const jsDocTags = ts.getJSDocTags(member);
                const formatTag = jsDocTags.find((tag) => tag.tagName.text === 'format');
                if (formatTag && formatTag.comment) {
                    format =
                        typeof formatTag.comment === 'string'
                            ? formatTag.comment.trim()
                            : formatTag.comment
                                  .map((c) => c.text)
                                  .join('')
                                  .trim();
                }

                properties.push({
                    name: propName,
                    type: propType,
                    required: !isOptional,
                    description,
                    format,
                    genericTypeRef,
                    genericInstanceType,
                });
            }
        }

        // Create a custom object type that can carry generic type reference info
        const innerType = new GenericPropertiesObjectType(interfaceName, properties);

        // Wrap in GenericInterfaceType
        const genericType = new GenericInterfaceType(interfaceName, innerType, typeParameters);

        return new tsj.DefinitionType(interfaceName, genericType);
    }
}

/**
 * Custom NodeParser for inline `TypeLiteralNode` (the `{a: X; b: Y}` form
 * used as anonymous object types in property positions and union variants).
 *
 * ts-json-schema-generator's default TypeLiteralNode parser does NOT extract
 * JSDoc tags from inline-literal property declarations. We mirror what the
 * default does, but additionally pull `@format` off each property's JSDoc
 * and wrap the property's type in an AnnotatedType so the downstream
 * AnnotatedTypeFormatterWithIntegers fires (number → integer promotion,
 * frozen handling, format passthrough).
 *
 * Limited to TypeLiteralNodes inside union members (where the bug bites);
 * applying it everywhere risks shadowing more-specific parsers.
 */
class InlineTypeLiteralAnnotationParser {
    constructor(typeChecker, childNodeParser) {
        this.typeChecker = typeChecker;
        this.childNodeParser = childNodeParser;
    }

    supportsNode(node) {
        if (node.kind !== ts.SyntaxKind.TypeLiteral) return false;
        // Only apply when at least one property carries a @format JSDoc tag
        // detected via leading-comment scanning. We can't use ts.getJSDocTags
        // here because TypeScript only associates JSDoc with select named
        // declarations — inline TypeLiteral PropertySignatures aren't one of
        // them, so the standard API returns empty.
        return node.members.some((m) => {
            if (m.kind !== ts.SyntaxKind.PropertySignature) return false;
            return !!this.extractFormat(m);
        });
    }

    extractFormat(propertyNode) {
        // TypeScript's `getJSDocTags` doesn't see JSDoc on inline TypeLiteral
        // members, and `getLeadingCommentRanges` only returns comments that
        // are physically before the node's leading-trivia start — which for
        // TypeLiteral members points at the opening `{`. We scan the raw
        // text between the property's pos and its name's start for a
        // `/** @format X */` JSDoc block.
        const sourceFile = propertyNode.getSourceFile();
        if (!sourceFile) return null;
        const text = sourceFile.getFullText();
        const sliceStart = propertyNode.pos;
        const sliceEnd = propertyNode.name?.getStart?.(sourceFile);
        if (sliceEnd == null || sliceEnd <= sliceStart) return null;
        const trivia = text.slice(sliceStart, sliceEnd);
        const m = trivia.match(/\/\*\*[\s\S]*?@format\s+([A-Za-z0-9_-]+)[\s\S]*?\*\//);
        return m ? m[1] : null;
    }

    createType(node, context) {
        const properties = [];
        for (const member of node.members) {
            if (member.kind !== ts.SyntaxKind.PropertySignature) continue;
            const propName = member.name.getText();
            const isOptional = !!member.questionToken;

            const rawType = this.childNodeParser.createType(member.type, context);

            const format = this.extractFormat(member);
            const propType = format ? new tsj.AnnotatedType(rawType, { format }, false) : rawType;
            properties.push(new tsj.ObjectProperty(propName, propType, !isOptional));
        }
        return new tsj.ObjectType(`inline-literal-${node.pos}`, [], properties, false);
    }
}

/**
 * Apply a JSDoc-extracted `@format` tag to a property's schema definition.
 * Mirrors AnnotatedTypeFormatterWithIntegers for non-generic types:
 *   - integer formats promote `type: "number"` to `type: "integer"`
 *   - `@format frozen` strips type info and marks the property opaque
 *
 * No-op for generic-type-ref properties (format on `T` is meaningless).
 */
function applyJSDocFormatToPropDef(propDef, prop) {
    if (!prop.format || prop.genericTypeRef) return;
    propDef.format = prop.format;
    if (propDef.type === 'number' && INTEGER_FORMATS.includes(prop.format)) {
        propDef.type = 'integer';
    }
    if (prop.format === 'frozen') {
        for (const k of Object.keys(propDef)) {
            if (k !== 'description') delete propDef[k];
        }
        propDef.type = 'object';
        propDef['x-frozen'] = true;
    }
}

/**
 * Custom object type that carries property metadata including generic type references.
 */
class GenericPropertiesObjectType extends tsj.BaseType {
    constructor(name, properties) {
        super();
        this.name = name;
        this.properties = properties;
    }

    getId() {
        return `generic-props-${this.name}`;
    }

    getProperties() {
        return this.properties;
    }
}

// ============================================================================
// Generic Interface Formatters
// ============================================================================

/**
 * Formatter for generic interfaces that adds x-generic-params extension.
 */
class GenericInterfaceTypeFormatter {
    constructor(childTypeFormatter) {
        this.childTypeFormatter = childTypeFormatter;
    }

    supportsType(type) {
        return type instanceof GenericInterfaceType;
    }

    getDefinition(type) {
        const innerType = type.getInnerType();
        const properties = {};
        const required = [];

        // Format properties, preserving generic type references
        for (const prop of innerType.getProperties()) {
            const propDef = {};

            if (prop.genericTypeRef) {
                // Property uses a generic type parameter
                propDef['x-generic-type-ref'] = prop.genericTypeRef;
            } else if (prop.genericInstanceType) {
                // Property is a generic instantiation parameterized by the parent's type params
                // (e.g. CryptoOnrampQuote<TQuoteMetadata>). Emit it as a vendor extension instead
                // of a $ref so the type argument survives to the Swift template.
                propDef['x-generic-instance-type'] = prop.genericInstanceType;
            } else {
                // Get the normal type definition
                const typeDef = this.childTypeFormatter.getDefinition(prop.type);
                Object.assign(propDef, typeDef);
            }

            applyJSDocFormatToPropDef(propDef, prop);

            if (prop.description) {
                propDef.description = prop.description;
            }

            properties[prop.name] = propDef;

            if (prop.required) {
                required.push(prop.name);
            }
        }

        // Build the schema definition
        const definition = {
            type: 'object',
            properties,
        };

        if (required.length > 0) {
            definition.required = required;
        }

        // Add generic parameters extension
        definition['x-is-generic'] = true;
        definition['x-generic-params'] = type.getTypeParameters().map((param) => {
            const paramDef = { name: param.name };
            // Note: We don't include constraint/default as Swift doesn't support them in the same way
            return paramDef;
        });

        return definition;
    }

    getChildren(type) {
        const children = [];
        const innerType = type.getInnerType();

        for (const prop of innerType.getProperties()) {
            if (!prop.genericTypeRef) {
                children.push(...this.childTypeFormatter.getChildren(prop.type));
            }
        }

        return children;
    }
}

/**
 * Formatter for GenericPropertiesObjectType (used as inner type of generic interfaces).
 */
class GenericPropertiesObjectTypeFormatter {
    constructor(childTypeFormatter) {
        this.childTypeFormatter = childTypeFormatter;
    }

    supportsType(type) {
        return type instanceof GenericPropertiesObjectType;
    }

    getDefinition(type) {
        const properties = {};
        const required = [];

        for (const prop of type.getProperties()) {
            const propDef = {};

            if (prop.genericTypeRef) {
                propDef['x-generic-type-ref'] = prop.genericTypeRef;
            } else if (prop.genericInstanceType) {
                propDef['x-generic-instance-type'] = prop.genericInstanceType;
            } else {
                const typeDef = this.childTypeFormatter.getDefinition(prop.type);
                Object.assign(propDef, typeDef);
            }

            applyJSDocFormatToPropDef(propDef, prop);

            if (prop.description) {
                propDef.description = prop.description;
            }

            properties[prop.name] = propDef;

            if (prop.required) {
                required.push(prop.name);
            }
        }

        const definition = {
            type: 'object',
            properties,
        };

        if (required.length > 0) {
            definition.required = required;
        }

        return definition;
    }

    getChildren(type) {
        const children = [];
        for (const prop of type.getProperties()) {
            if (!prop.genericTypeRef) {
                children.push(...this.childTypeFormatter.getChildren(prop.type));
            }
        }
        return children;
    }
}

// ============================================================================
// Custom Formatters for OpenAPI $ref paths
// ============================================================================

/**
 * Custom DefinitionTypeFormatter that outputs OpenAPI-style refs.
 */
class OpenAPIDefinitionTypeFormatter {
    constructor(childTypeFormatter) {
        this.childTypeFormatter = childTypeFormatter;
    }

    supportsType(type) {
        return type instanceof tsj.DefinitionType;
    }

    getDefinition(type) {
        const name = type.getName();
        return { $ref: `#/components/schemas/${encodeURIComponent(name)}` };
    }

    getChildren(type) {
        const children = [type, ...this.childTypeFormatter.getChildren(type.getType())];
        return children.filter((v, i, a) => a.indexOf(v) === i);
    }
}

/**
 * Custom ReferenceTypeFormatter that outputs OpenAPI-style refs.
 * Handles recursive type references.
 */
class OpenAPIReferenceTypeFormatter {
    constructor(childTypeFormatter) {
        this.childTypeFormatter = childTypeFormatter;
    }

    supportsType(type) {
        return type instanceof tsj.ReferenceType;
    }

    getDefinition(type) {
        const name = type.getName();
        return { $ref: `#/components/schemas/${encodeURIComponent(name)}` };
    }

    getChildren(type) {
        const referredType = type.getType();
        if (referredType instanceof tsj.DefinitionType) {
            return this.childTypeFormatter.getChildren(referredType);
        }
        return this.childTypeFormatter.getChildren(new tsj.DefinitionType(type.getName(), type.getType()));
    }
}

// ============================================================================
// Custom Schema Generator
// ============================================================================

/**
 * Custom SchemaGenerator that ensures all root types are included in definitions.
 * When using type: '*', the standard generator only includes types that are
 * referenced by other types. This custom generator wraps root types in
 * DefinitionType so they are all included.
 */
class AllTypesSchemaGenerator extends tsj.SchemaGenerator {
    /**
     * Override to allow generic interfaces through to the parser.
     * The base class skips generic types, but we want to process them
     * with our custom GenericInterfaceNodeParser.
     */
    isGenericType(node) {
        // Allow generic interfaces - they will be handled by GenericInterfaceNodeParser
        if (node.kind === ts.SyntaxKind.InterfaceDeclaration) {
            return false;
        }
        // Keep default behavior for type aliases
        return !!(node.typeParameters && node.typeParameters.length > 0);
    }

    createSchemaFromNodes(rootNodes) {
        const roots = [];
        for (const rootNode of rootNodes) {
            try {
                const rootType = this.nodeParser.createType(rootNode, new tsj.Context());
                roots.push({ rootNode, rootType });
            } catch {
                // Skip nodes that can't be parsed (e.g., const objects with identifier references)
            }
        }

        const definitions = {};

        for (const root of roots) {
            // Wrap root type in DefinitionType if it isn't already
            let wrappedType = root.rootType;
            if (!(wrappedType instanceof tsj.DefinitionType)) {
                // Try to get the type name from the node
                const name = this.getTypeName(root.rootNode);
                if (name) {
                    wrappedType = new tsj.DefinitionType(name, root.rootType);
                }
            }

            // Get children including the wrapped root type
            this.appendRootChildDefinitions(wrappedType, definitions);
        }

        return {
            $schema: 'http://json-schema.org/draft-07/schema#',
            definitions,
        };
    }

    getTypeName(node) {
        if (node.name) {
            return node.name.getText ? node.name.getText() : node.name.escapedText;
        }
        return null;
    }

    appendRootChildDefinitions(rootType, childDefinitions) {
        const seen = new Set();

        const children = this.typeFormatter
            .getChildren(rootType)
            .filter((child) => child instanceof tsj.DefinitionType)
            .filter((child) => {
                const id = child.getId();
                if (!seen.has(id)) {
                    seen.add(id);
                    return true;
                }
                return false;
            });

        for (const child of children) {
            const name = child.getName();
            if (!(name in childDefinitions)) {
                childDefinitions[name] = this.typeFormatter.getDefinition(child.getType());
            }
        }
    }
}

// ============================================================================
// Post-processing: Interface Discriminated Unions
// ============================================================================

/**
 * Convert a string to camelCase.
 */
function toCamelCase(str) {
    if (str.includes('_')) {
        return str.toLowerCase().replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    }
    // PascalCase to camelCase
    if (str.length > 0 && str[0] === str[0].toUpperCase() && str[0] !== str[0].toLowerCase()) {
        return str[0].toLowerCase() + str.slice(1);
    }
    return str;
}

/**
 * Extract type name from a $ref string like "#/components/schemas/TestWithMessage"
 */
function typeNameFromRef(ref) {
    const parts = ref.split('/');
    return decodeURIComponent(parts[parts.length - 1]);
}

/**
 * True when `schema` is a bare `$ref` (no array wrapper) pointing at the
 * definition named `parentName`. Used to detect direct (non-array) recursive
 * references — Swift requires `indirect case` in that situation.
 */
function isDirectSelfRef(schema, parentName) {
    if (!schema || typeof schema !== 'object') return false;
    if (!schema.$ref || typeof schema.$ref !== 'string') return false;
    return typeNameFromRef(schema.$ref) === parentName;
}

/**
 * Detect if a schema object is an interface discriminated union.
 * ts-json-schema-generator generates: allOf with if/then conditionals, properties with enum for discriminator.
 * Returns { discriminatorField, cases: [{rawValue, ref}] } or null.
 */
function detectDiscriminatedUnion(schemaDef) {
    if (!schemaDef.allOf || !Array.isArray(schemaDef.allOf)) return null;

    // Find if/then entries in allOf
    const ifThenEntries = schemaDef.allOf.filter((item) => item.if && item.then);
    if (ifThenEntries.length === 0) return null;

    // Extract discriminator field and cases from if/then entries
    let discriminatorField = null;
    const cases = [];

    for (const entry of ifThenEntries) {
        const ifProps = entry.if?.properties;
        if (!ifProps) continue;

        const fieldNames = Object.keys(ifProps);
        if (fieldNames.length !== 1) continue;

        const fieldName = fieldNames[0];
        const constValue = ifProps[fieldName]?.const;
        if (constValue === undefined) continue;

        const ref = entry.then?.$ref;
        if (!ref) continue;

        if (discriminatorField === null) {
            discriminatorField = fieldName;
        } else if (discriminatorField !== fieldName) {
            return null; // Inconsistent discriminator fields
        }

        cases.push({ rawValue: String(constValue), ref });
    }

    if (!discriminatorField || cases.length === 0) return null;
    return { discriminatorField, cases };
}

/**
 * Build a discriminated union schema from detected cases.
 * Returns the transformed definition.
 */
function buildInterfaceUnionSchema(discriminatorField, cases) {
    const properties = {};

    for (const { rawValue, ref } of cases) {
        const caseName = toCamelCase(rawValue);
        const propKey = `x_${caseName}`;

        properties[propKey] = {
            allOf: [{ $ref: ref }],
            'x-enum-case-name': caseName,
            'x-enum-case-raw-value': rawValue,
        };
    }

    return {
        type: 'object',
        properties,
        'x-discriminated-union': true,
        'x-interface-union': true,
        'x-discriminator-field': discriminatorField,
    };
}

/**
 * Process member types: remove discriminator property, add x-constant-fields.
 */
function processDiscriminatorMemberTypes(cases, discriminatorField, definitions) {
    for (const { rawValue, ref } of cases) {
        const memberName = typeNameFromRef(ref);
        const memberDef = definitions[memberName];
        if (!memberDef || !memberDef.properties) continue;

        // Skip if already processed (member may participate in multiple unions)
        if (memberDef['x-constant-fields']) continue;

        const discProp = memberDef.properties[discriminatorField];
        if (!discProp) continue;

        // Get the constant value
        const constantValue = discProp.const || (discProp.enum && discProp.enum[0]) || rawValue;

        // Remove discriminator from properties
        delete memberDef.properties[discriminatorField];

        // Remove from required
        if (memberDef.required) {
            memberDef.required = memberDef.required.filter((r) => r !== discriminatorField);
            if (memberDef.required.length === 0) {
                delete memberDef.required;
            }
        }

        // Add constant fields extension
        memberDef['x-constant-fields'] = [
            {
                name: discriminatorField,
                value: String(constantValue),
                type: 'String',
            },
        ];
    }
}

/**
 * Post-process schema to transform interface discriminated unions.
 * Handles both top-level type aliases and inline property unions.
 *
 * ts-json-schema-generator generates discriminated unions as:
 * { allOf: [{ if: { properties: { name: { const: "value" } } }, then: { $ref: "..." } }, ...] }
 */
/**
 * Pre-step before Case A/B run: hoist inline anonymous discriminated unions
 * (`anyOf` of objects with a single-literal discriminator field) out of
 * property positions into top-level synthesized definitions so the regular
 * Case A pipeline can normalise them into `x-interface-union` form. The
 * synthesized union is tagged `x-nested-under` / `x-nested-name` so it gets
 * aggregated onto the parent as a nested type rather than emitting its own
 * file.
 */
function hoistInlineDiscriminatedUnions(schema) {
    const definitions = schema.definitions || {};

    for (const [parentName, typeDef] of Object.entries(definitions)) {
        if (!typeDef.properties) continue;
        for (const [propName, propDef] of Object.entries(typeDef.properties)) {
            if (!isAnyOfDiscriminatedUnion(propDef)) continue;

            const nestedName = propName.charAt(0).toUpperCase() + propName.slice(1);
            const unionName = `${parentName}${nestedName}`;

            const variantRefs = [];
            for (const variant of propDef.anyOf) {
                const discriminator = getInlineVariantDiscriminator(variant);
                if (!discriminator) continue;
                const { field, value } = discriminator;
                const variantPascal = String(value).charAt(0).toUpperCase() + String(value).slice(1);
                const variantName = `${unionName}${variantPascal}`;
                // Hoist variant inline schema to a top-level definition.
                definitions[variantName] = JSON.parse(JSON.stringify(variant));
                variantRefs.push({ field, value, ref: `#/components/schemas/${variantName}` });
            }
            if (variantRefs.length === 0) continue;

            // Build the canonical `allOf + if/then` union shape so Case A
            // detects it on its next pass.
            const allOf = variantRefs.map(({ field, value, ref }) => ({
                if: { properties: { [field]: { const: value } } },
                then: { $ref: ref },
            }));
            definitions[unionName] = {
                allOf,
                'x-nested-under': parentName,
                'x-nested-name': nestedName,
                'x-skip-model': true,
            };

            // Rewrite the parent's property to reference the synthesized
            // union by its nested local name (no TON prefix).
            Object.keys(propDef).forEach((k) => delete propDef[k]);
            propDef.type = 'object';
            propDef['x-nested-type-ref'] = nestedName;
        }
    }
}

function isAnyOfDiscriminatedUnion(propDef) {
    if (!propDef || !Array.isArray(propDef.anyOf) || propDef.anyOf.length < 2) return false;
    return propDef.anyOf.every((variant) => getInlineVariantDiscriminator(variant) !== null);
}

function getInlineVariantDiscriminator(variant) {
    if (!variant || variant.type !== 'object' || !variant.properties) return null;
    for (const [fieldName, fieldSchema] of Object.entries(variant.properties)) {
        if (fieldSchema && typeof fieldSchema === 'object') {
            if (typeof fieldSchema.const === 'string') {
                return { field: fieldName, value: fieldSchema.const };
            }
            if (
                Array.isArray(fieldSchema.enum) &&
                fieldSchema.enum.length === 1 &&
                typeof fieldSchema.enum[0] === 'string'
            ) {
                return { field: fieldName, value: fieldSchema.enum[0] };
            }
        }
    }
    return null;
}

function postProcessDiscriminatedUnions(schema) {
    const definitions = schema.definitions || {};

    for (const [parentName, typeDef] of Object.entries(definitions)) {
        // Case A: Top-level discriminated union
        const topLevel = detectDiscriminatedUnion(typeDef);
        if (topLevel) {
            const unionSchema = buildInterfaceUnionSchema(topLevel.discriminatorField, topLevel.cases);
            // Replace definition in-place, preserving extensions that drive
            // downstream behaviour outside Case A's reach (nested-type
            // routing, x-skip-model from the inline-union hoist).
            const preserved = {};
            for (const k of ['x-nested-under', 'x-nested-name', 'x-skip-model']) {
                if (k in typeDef) preserved[k] = typeDef[k];
            }
            Object.keys(typeDef).forEach((k) => delete typeDef[k]);
            Object.assign(typeDef, unionSchema, preserved);
            processDiscriminatorMemberTypes(topLevel.cases, topLevel.discriminatorField, definitions);

            // Detect empty and single-field variants
            const singleFieldCodingKeys = new Set();
            for (const { rawValue, ref } of topLevel.cases) {
                const memberName = typeNameFromRef(ref);
                const memberDef = definitions[memberName];
                if (!memberDef?.properties) continue;

                const propKeys = Object.keys(memberDef.properties);
                const caseName = toCamelCase(rawValue);
                const propKey = `x_${caseName}`;
                const caseProp = typeDef.properties[propKey];
                if (!caseProp) continue;

                if (propKeys.length === 0) {
                    // Empty variant: no properties after discriminator removal
                    caseProp['x-empty-variant'] = true;
                } else if (propKeys.length === 1) {
                    // Single-field variant: inline the field as associated value
                    const fieldName = propKeys[0];
                    const fieldSchema = memberDef.properties[fieldName];
                    const isRequired = memberDef.required?.includes(fieldName) ?? false;

                    // Preserve existing vendor extensions
                    const vendorExts = {};
                    for (const [k, v] of Object.entries(caseProp)) {
                        if (k.startsWith('x-')) vendorExts[k] = v;
                    }

                    // Replace case property schema with the field's schema
                    Object.keys(caseProp).forEach((k) => delete caseProp[k]);
                    if (fieldSchema.$ref) {
                        caseProp.allOf = [{ $ref: fieldSchema.$ref }];
                    } else {
                        Object.assign(caseProp, { ...fieldSchema });
                    }

                    // Restore + add vendor extensions
                    Object.assign(caseProp, vendorExts);
                    caseProp['x-single-field-variant'] = true;
                    caseProp['x-single-field-name'] = fieldName;
                    if (!isRequired) {
                        caseProp['x-single-field-optional'] = true;
                    }

                    // Detect direct (non-array) recursive reference back to the
                    // parent union — Swift needs `indirect case` to permit a
                    // value-type cycle. Array recursion (`Parent[]`) doesn't
                    // need it because the array boxes the element.
                    if (isDirectSelfRef(fieldSchema, parentName)) {
                        caseProp['x-indirect'] = true;
                    }

                    singleFieldCodingKeys.add(fieldName);

                    // Mark member for suppression
                    memberDef['x-skip-model'] = true;
                }
            }

            // Add unique coding keys for single-field variants
            if (singleFieldCodingKeys.size > 0) {
                typeDef['x-single-field-coding-keys'] = [...singleFieldCodingKeys].map((k) => ({ name: k }));
            }
            continue;
        }

        // Inline (property-level) discriminated unions are pre-hoisted to
        // top-level definitions by `hoistInlineDiscriminatedUnions`, which
        // runs before this function. They're then picked up by Case A above
        // (because the hoisted union has the canonical `allOf + if/then`
        // shape). The `aggregateNestedTypes` post-step splices them into
        // their parent as nested types.
    }
}

/**
 * Walk the entire schema (definitions + nested) and, for every node with
 * `type: "integer"` and a `format`, attach a boolean flag under
 * `x-int-format-flags` keyed by the format name (e.g. `{int32: true}`).
 *
 * Language-neutral: the keys are the canonical OpenAPI format names. Each
 * downstream language template uses these to dispatch on the format with
 * plain mustache section gating (no string-equality support required).
 */
function postProcessIntegerFormatFlags(schema) {
    const visit = (node) => {
        if (!node || typeof node !== 'object') return;
        if (Array.isArray(node)) {
            node.forEach(visit);
            return;
        }
        if (node.type === 'integer' && typeof node.format === 'string') {
            node['x-int-format-flags'] = { [node.format]: true };
        }
        Object.values(node).forEach(visit);
    };
    visit(schema);
}

/**
 * After `postProcessDiscriminatedUnions`, find every definition marked
 * `x-nested-under: <ParentName>` and attach a flattened, mustache-friendly
 * record to `<Parent>['x-nested-types']`. Each record carries an `x-cases`
 * array of {name, rawValue, ...} so the template can iterate cases without
 * needing map-iteration support.
 */
function aggregateNestedTypes(schema) {
    const definitions = schema.definitions || {};

    for (const [, def] of Object.entries(definitions)) {
        if (!def['x-nested-under']) continue;
        const parent = definitions[def['x-nested-under']];
        if (!parent) continue;
        if (!parent['x-nested-types']) parent['x-nested-types'] = [];

        const cases = [];
        for (const [, caseProp] of Object.entries(def.properties || {})) {
            const caseName = caseProp['x-enum-case-name'];
            if (!caseName) continue;
            const record = {
                name: caseName,
                rawValue: caseProp['x-enum-case-raw-value'],
                'x-empty-variant': !!caseProp['x-empty-variant'],
                'x-single-field-variant': !!caseProp['x-single-field-variant'],
                'x-single-field-name': caseProp['x-single-field-name'],
                'x-single-field-optional': !!caseProp['x-single-field-optional'],
                'x-indirect': !!caseProp['x-indirect'],
            };
            // Stash the value schema (single-field schema for inlining, or
            // the multi-field member ref via allOf) so the template can
            // resolve the case's Swift type. Both fields are language-neutral.
            if (caseProp['x-single-field-variant']) {
                Object.assign(record, valueSchemaShape(caseProp));
            } else if (!caseProp['x-empty-variant'] && caseProp.allOf && caseProp.allOf[0] && caseProp.allOf[0].$ref) {
                record['x-value-type-ref'] = true;
                record['x-value-ref-name'] = typeNameFromRef(caseProp.allOf[0].$ref);
            }
            cases.push(record);
        }

        parent['x-nested-types'].push({
            'nested-name': def['x-nested-name'],
            'discriminator-field': def['x-discriminator-field'],
            'x-cases': cases,
            'x-single-field-coding-keys': def['x-single-field-coding-keys'] || [],
        });
    }
}

/**
 * Reduce a case property's value schema to a set of `x-value-*` flags
 * mustache can dispatch on. Mirrors the layout of `x-int-format-flags` so
 * the same _swiftIntegerType partial can be reused for integer formats.
 */
function valueSchemaShape(caseProp) {
    const shape = {};
    if (caseProp.$ref) {
        shape['x-value-type-ref'] = true;
        shape['x-value-ref-name'] = typeNameFromRef(caseProp.$ref);
        return shape;
    }
    if (caseProp.type === 'string') {
        shape['x-value-type-string'] = true;
    } else if (caseProp.type === 'integer') {
        shape['x-value-type-integer'] = true;
        if (caseProp.format) shape['x-value-format'] = caseProp.format;
        // _swiftIntegerType.mustache reads
        // `vendorExtensions.x-int-format-flags.<format>` regardless of the
        // host scope. Wrap the flags in a synthetic `vendorExtensions` so
        // the partial works when its scope is a nested-case record.
        const flags = caseProp['x-int-format-flags'] || (caseProp.format ? { [caseProp.format]: true } : null);
        if (flags) {
            shape.vendorExtensions = { 'x-int-format-flags': flags };
        }
    } else if (caseProp.type === 'number') {
        shape['x-value-type-number'] = true;
    } else if (caseProp.type === 'boolean') {
        shape['x-value-type-boolean'] = true;
    } else if (caseProp.type === 'array') {
        shape['x-value-type-array'] = true;
    }
    return shape;
}

/**
 * Post-process schema to convert single-literal properties to constant fields.
 * Properties with { const: "value" } or { enum: ["singleValue"] } become x-constant-fields.
 */
function postProcessConstantFields(schema) {
    const definitions = schema.definitions || {};

    for (const typeDef of Object.values(definitions)) {
        if (!typeDef.properties) continue;

        for (const [propName, propDef] of Object.entries(typeDef.properties)) {
            // Detect single-literal: { const: "value" } or { enum: ["value"] }
            let constantValue = null;
            if (propDef.const !== undefined) {
                constantValue = String(propDef.const);
            } else if (propDef.enum && Array.isArray(propDef.enum) && propDef.enum.length === 1) {
                constantValue = String(propDef.enum[0]);
            }
            if (constantValue === null) continue;

            // Remove from properties
            delete typeDef.properties[propName];

            // Remove from required
            if (typeDef.required) {
                typeDef.required = typeDef.required.filter((r) => r !== propName);
                if (typeDef.required.length === 0) {
                    delete typeDef.required;
                }
            }

            // Add to x-constant-fields
            if (!typeDef['x-constant-fields']) {
                typeDef['x-constant-fields'] = [];
            }
            typeDef['x-constant-fields'].push({
                name: propName,
                value: constantValue,
                type: 'String',
            });
        }
    }
}

/**
 * Post-process schema to convert pure $ref definitions (type aliases) into
 * x-type-alias markers so openapi-generator will create a file and the
 * template can emit a Swift typealias.
 */
/**
 * Post-process schema to strip `default` values from properties.
 * @default JSDoc is documentation-only and should not produce default values in generated code.
 */
function postProcessStripDefaults(schema) {
    const definitions = schema.definitions || {};
    for (const typeDef of Object.values(definitions)) {
        if (!typeDef.properties) continue;
        for (const propDef of Object.values(typeDef.properties)) {
            delete propDef.default;
        }
    }
}

/**
 * Post-process schema to detect unions of string literals + a single ref to a
 * primitive string type, e.g. `type X = 'a' | 'b' | UserFriendlyAddress`.
 *
 * ts-json-schema-generator hoists each string literal into its own synthetic
 * single-value enum definition (named e.g. `<CAPS_LITERAL><ParentName>`) and
 * emits the union as `anyOf` of `$ref`s. We detect that shape and rewrite it
 * into a Swift-friendly vendor extension that the template turns into:
 *
 *     enum X { case a; case b; case userFriendlyAddress(UserFriendlyAddress) }
 *
 * Detection: definition has `anyOf` where every entry is a `$ref`, each
 * referenced definition is either a single-value string enum (literal case) or
 * a plain `{type:"string"}` (ref case), with >=1 literal and exactly 1 ref.
 */
function postProcessStringLiteralUnions(schema) {
    const definitions = schema.definitions || {};

    // Classify an anyOf entry. Returns {kind: 'literal', rawValue} or
    // {kind: 'ref', targetName, synthetic} or null.
    const classifyEntry = (entry) => {
        if (!entry || typeof entry !== 'object') return null;

        // Inline string literal: { type: "string", const: "..." } or enum of one
        if (entry.type === 'string' && !entry.$ref) {
            if (typeof entry.const === 'string') return { kind: 'literal', rawValue: entry.const };
            if (Array.isArray(entry.enum) && entry.enum.length === 1) {
                return { kind: 'literal', rawValue: String(entry.enum[0]) };
            }
        }

        // $ref: classify based on the referenced definition
        if (typeof entry.$ref === 'string' && Object.keys(entry).length === 1) {
            const targetName = typeNameFromRef(entry.$ref);
            const target = definitions[targetName];
            if (!target) return null;
            if (target.type === 'string' && !target.$ref) {
                if (Array.isArray(target.enum) && target.enum.length === 1 && typeof target.enum[0] === 'string') {
                    return { kind: 'literal', rawValue: target.enum[0], synthetic: targetName };
                }
                if (!target.enum && typeof target.const !== 'string') {
                    return { kind: 'ref', targetName };
                }
            }
        }

        return null;
    };

    const synthLiteralsToDelete = new Set();

    for (const [, typeDef] of Object.entries(definitions)) {
        if (!Array.isArray(typeDef.anyOf) || typeDef.anyOf.length < 2) continue;

        const classified = typeDef.anyOf.map(classifyEntry);
        if (classified.some((c) => c === null)) continue;

        const literalCases = classified.filter((c) => c.kind === 'literal');
        const refCases = classified.filter((c) => c.kind === 'ref');
        if (literalCases.length < 1 || refCases.length !== 1) continue;

        for (const { synthetic } of literalCases) {
            if (synthetic) synthLiteralsToDelete.add(synthetic);
        }

        const refCase = refCases[0];
        Object.keys(typeDef).forEach((k) => delete typeDef[k]);
        typeDef.type = 'object';
        typeDef.properties = { _placeholder: { type: 'string' } };
        typeDef['x-string-literal-union'] = true;
        typeDef['x-literal-cases'] = literalCases.map(({ rawValue }) => ({
            name: toCamelCase(rawValue),
            rawValue,
        }));
        typeDef['x-ref-case'] = {
            name: toCamelCase(refCase.targetName),
            typeRef: refCase.targetName,
        };
    }

    if (synthLiteralsToDelete.size === 0) return;

    // Ensure the synthetic literal definitions aren't still referenced elsewhere
    // before deleting them.
    const stillReferenced = new Set();
    const visit = (obj) => {
        if (obj === null || typeof obj !== 'object') return;
        if (typeof obj.$ref === 'string') {
            const name = typeNameFromRef(obj.$ref);
            if (synthLiteralsToDelete.has(name)) stillReferenced.add(name);
        }
        for (const value of Object.values(obj)) visit(value);
    };
    visit(definitions);

    for (const name of synthLiteralsToDelete) {
        if (!stillReferenced.has(name)) delete definitions[name];
    }
}

function postProcessTypeAliases(schema) {
    const definitions = schema.definitions || {};
    const PRIMITIVE_TYPES = new Set(['string', 'number', 'boolean']);

    for (const [, typeDef] of Object.entries(definitions)) {
        // $ref-target alias: `type X = SomeModel`.
        if (typeDef.$ref && !typeDef.type && !typeDef.properties && !typeDef.allOf && !typeDef['x-enum-case-name']) {
            const targetName = typeNameFromRef(typeDef.$ref);

            Object.keys(typeDef).forEach((k) => delete typeDef[k]);
            typeDef.type = 'object';
            typeDef.properties = { _alias: { type: 'string' } };
            typeDef['x-type-alias'] = true;
            typeDef['x-alias-target'] = targetName;
            continue;
        }

        // Primitive alias: `type X = string` (or number / boolean). The
        // resulting schema has only a `type` field and no structural shape.
        // Without this branch openapi-generator filters the definition out
        // ("nothing to generate"), so any model referencing the alias by name
        // ends up with a dangling type reference in the generated Swift.
        if (
            !typeDef.$ref &&
            PRIMITIVE_TYPES.has(typeDef.type) &&
            !typeDef.properties &&
            !typeDef.enum &&
            typeDef.const === undefined &&
            !typeDef.allOf &&
            !typeDef.anyOf &&
            !typeDef.oneOf &&
            !typeDef['x-enum-case-name']
        ) {
            const primitiveType = typeDef.type;
            Object.keys(typeDef).forEach((k) => delete typeDef[k]);
            typeDef.type = 'object';
            typeDef.properties = { _alias: { type: 'string' } };
            typeDef['x-type-alias'] = true;
            typeDef[`x-primitive-${primitiveType}`] = true;
        }
    }
}

/**
 * Rename definitions that have x-definition-name and update all $refs.
 */
function postProcessDefinitionNames(schema) {
    const definitions = schema.definitions || {};
    const renames = {};

    // Collect renames
    for (const [name, def] of Object.entries(definitions)) {
        if (def['x-definition-name']) {
            renames[name] = def['x-definition-name'];
            delete def['x-definition-name'];
        }
    }

    if (Object.keys(renames).length === 0) return;

    // Apply renames to definitions
    for (const [oldName, newName] of Object.entries(renames)) {
        definitions[newName] = definitions[oldName];
        delete definitions[oldName];
    }

    // Update all $refs in the schema
    const oldToNewRef = {};
    for (const [oldName, newName] of Object.entries(renames)) {
        oldToNewRef[`#/definitions/${oldName}`] = `#/definitions/${newName}`;
        oldToNewRef[`#/components/schemas/${oldName}`] = `#/components/schemas/${newName}`;
    }
    updateRefs(definitions, oldToNewRef);
}

function updateRefs(obj, refMap) {
    if (obj === null || typeof obj !== 'object') return;
    if (obj.$ref && refMap[obj.$ref]) {
        obj.$ref = refMap[obj.$ref];
    }
    for (const value of Object.values(obj)) {
        updateRefs(value, refMap);
    }
}

/**
 * Convert SCREAMING_SNAKE_CASE / snake_case names to PascalCase.
 * `FOO_BAR_BAZ` → `FooBarBaz`, `foo_bar` → `FooBar`. Names without an
 * underscore are not snake_case — left as-is so acronyms like `NFT`, `URL`,
 * `OK` keep their canonical form.
 */
function toPascalCase(str) {
    if (typeof str !== 'string' || str.length === 0) return str;
    if (str.includes('_')) {
        return str
            .toLowerCase()
            .split('_')
            .filter(Boolean)
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join('');
    }
    return str;
}

/**
 * Rename schema definitions whose name is snake_case or SCREAMING_SNAKE_CASE
 * to PascalCase, and update every `$ref` accordingly. Names without an
 * underscore are not considered snake_case and are left alone (so acronyms
 * like `NFT`, `URL` keep their canonical form).
 *
 * Runs early so the rest of the post-processing pipeline sees the final names
 * when it materialises type references into vendor extensions.
 */
function postProcessTypeNameCasing(schema) {
    const definitions = schema.definitions || {};
    const renames = {};

    for (const name of Object.keys(definitions)) {
        if (!name.includes('_')) continue;

        const newName = toPascalCase(name);
        if (newName !== name) renames[name] = newName;
    }

    if (Object.keys(renames).length === 0) return;

    for (const [oldName, newName] of Object.entries(renames)) {
        if (newName !== oldName && newName in definitions) {
            console.warn(
                `[type-name-casing] cannot rename ${oldName} -> ${newName}: collides with existing definition`,
            );
            delete renames[oldName];
            continue;
        }
        definitions[newName] = definitions[oldName];
        delete definitions[oldName];
    }

    const refMap = {};
    for (const [oldName, newName] of Object.entries(renames)) {
        refMap[`#/definitions/${oldName}`] = `#/definitions/${newName}`;
        refMap[`#/components/schemas/${oldName}`] = `#/components/schemas/${newName}`;
    }
    updateRefs(definitions, refMap);
}

// ============================================================================
// Main
// ============================================================================

const args = process.argv.slice(2);
const inputPath = args[0];
const outputPath = args[1];

if (!inputPath || !outputPath) {
    console.error('Usage: node generate-json-schema.js <input-path> <output-path>');
    process.exit(1);
}

const config = {
    path: inputPath,
    tsconfig: path.resolve(__dirname, '../../../tsconfig.json'),
    type: '*',
    expose: 'all',
    jsDoc: 'extended',
    skipTypeCheck: true,
};

try {
    const program = tsj.createProgram(config);
    const typeChecker = program.getTypeChecker();

    const parser = tsj.createParser(program, config, (prs) => {
        prs.addNodeParser(new ConstEnumNodeParser(typeChecker));
        prs.addNodeParser(new EnumNodeParserWithNames(typeChecker));
        prs.addNodeParser(new DiscriminatedUnionNodeParser(typeChecker, prs));
        prs.addNodeParser(new GenericInterfaceNodeParser(typeChecker, prs));
        prs.addNodeParser(new InlineTypeLiteralAnnotationParser(typeChecker, prs));
    });

    const formatter = tsj.createFormatter(config, (fmt, circularReferenceTypeFormatter) => {
        fmt.addTypeFormatter(new OpenAPIDefinitionTypeFormatter(circularReferenceTypeFormatter));
        fmt.addTypeFormatter(new OpenAPIReferenceTypeFormatter(circularReferenceTypeFormatter));
        fmt.addTypeFormatter(new AnnotatedTypeFormatterWithIntegers(circularReferenceTypeFormatter));
        fmt.addTypeFormatter(new EnumTypeFormatterWithVarnames());
        fmt.addTypeFormatter(new SyntheticValueTypeFormatter(circularReferenceTypeFormatter));
        fmt.addTypeFormatter(new DiscriminatedUnionTypeFormatter(circularReferenceTypeFormatter));
        fmt.addTypeFormatter(new GenericInterfaceTypeFormatter(circularReferenceTypeFormatter));
        fmt.addTypeFormatter(new GenericPropertiesObjectTypeFormatter(circularReferenceTypeFormatter));
    });

    const generator = new AllTypesSchemaGenerator(program, parser, formatter, config);
    const schema = generator.createSchema(config.type);

    // Post-process: rename definitions with x-definition-name
    postProcessDefinitionNames(schema);

    // Post-process: rewrite SCREAMING_SNAKE_CASE / snake_case definition names
    // to PascalCase so the Swift generator produces ConnectEventErrorCodes,
    // not CONNECTEVENTERRORCODES. Runs before any step that materialises type
    // names into vendor extensions so those see the final name.
    postProcessTypeNameCasing(schema);

    // Post-process: hoist inline (property-level) discriminated unions into
    // top-level synthesized definitions so the Case A pipeline can normalise
    // them. The synthesized union carries x-nested-under so it's aggregated
    // onto the parent as a nested type later.
    hoistInlineDiscriminatedUnions(schema);

    // Post-process: transform @discriminator annotated unions into discriminated union schemas
    postProcessDiscriminatedUnions(schema);

    // Post-process: aggregate nested-type metadata onto each parent so the
    // Swift template can render the nested enum body inline.
    aggregateNestedTypes(schema);

    // Post-process: attach x-int-format-flags to every integer schema with a
    // format, so language templates can dispatch on the format using plain
    // mustache section gating.
    postProcessIntegerFormatFlags(schema);

    // Post-process: convert single-literal properties to constant fields
    postProcessConstantFields(schema);

    // Post-process: strip @default values (documentation-only, not for codegen)
    postProcessStripDefaults(schema);

    // Post-process: detect string-literal + ref unions and rewrite to x-string-literal-union
    postProcessStringLiteralUnions(schema);

    // Post-process: convert pure $ref definitions (type aliases) to x-type-alias
    postProcessTypeAliases(schema);

    fs.writeFileSync(outputPath, JSON.stringify(schema, null, 2));
} catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
}
