/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

// ----------------------------------------------------------------------------
// Case 1: Basic TypeScript enum (numeric values)
// ----------------------------------------------------------------------------
// Exercises EnumNodeParserWithNames + EnumTypeFormatterWithVarnames.
// Member names are camelCased into x-enum-varnames.

/** Case 1 — basic numeric enum without @format. */
export enum BasicNumericEnum {
    Foo = 0,
    Bar = 1,
    Baz = 2,
}

// ----------------------------------------------------------------------------
// Case 2: TS enum with @format int32
// ----------------------------------------------------------------------------
// Exercises AnnotatedTypeFormatterWithIntegers — the JSON Schema type
// flips from "number" to "integer" because of the @format tag.

/** @format int32 */
export enum Int32FormatEnum {
    Ok = 0,
    NotFound = 404,
    InternalError = 500,
}

// ----------------------------------------------------------------------------
// Case 3: SCREAMING_SNAKE_CASE definition name
// ----------------------------------------------------------------------------
// Exercises postProcessTypeNameCasing — the schema's definition key is
// rewritten from SCREAMING_SNAKE_CASE_FIXTURE to ScreamingSnakeCaseFixture,
// then the Swift codegen prepends TON.

export enum SCREAMING_SNAKE_CASE_FIXTURE {
    FirstValue = 1,
    SecondValue = 2,
}

// ----------------------------------------------------------------------------
// Case 4: Const-object enum
// ----------------------------------------------------------------------------
// Exercises ConstEnumNodeParser + postProcessDefinitionNames.
// The type alias `…Value` is renamed back to the const name via
// x-definition-name.

export const CONST_OBJECT_ENUM_FOO = 'CONST_OBJECT_ENUM_FOO';
export const CONST_OBJECT_ENUM_BAR = 'CONST_OBJECT_ENUM_BAR';
export const ConstObjectEnum = {
    CONST_OBJECT_ENUM_FOO: CONST_OBJECT_ENUM_FOO,
    CONST_OBJECT_ENUM_BAR: CONST_OBJECT_ENUM_BAR,
} as const;
export type ConstObjectEnumValue = (typeof ConstObjectEnum)[keyof typeof ConstObjectEnum];

// ----------------------------------------------------------------------------
// Case 5: Discriminated union with @discriminator
// ----------------------------------------------------------------------------
// Exercises DiscriminatedUnionNodeParser + postProcessDiscriminatedUnions.
// Covers three variant shapes at once:
//   - Alpha:   one non-discriminator field   → single-field variant (inlined)
//   - Beta:    multiple non-discriminator fields → separate type kept
//   - Gamma:   no non-discriminator fields   → empty variant

/** @discriminator type */
export type DiscriminatedUnion = DiscriminatedUnionAlpha | DiscriminatedUnionBeta | DiscriminatedUnionGamma;

export interface DiscriminatedUnionAlpha {
    type: 'alpha';
    alphaValue: string;
}

export interface DiscriminatedUnionBeta {
    type: 'beta';
    betaValue: string;
    /** @format int32 */
    betaCount: number;
}

export interface DiscriminatedUnionGamma {
    type: 'gamma';
}

// ----------------------------------------------------------------------------
// Case 6: Inline (property-level) discriminated union
// ----------------------------------------------------------------------------
// Exercises postProcessDiscriminatedUnions "Case B" — a property whose
// shape is a discriminated union without its own top-level alias. The
// parent type gets a nested enum named after the property.

export interface InlineDiscriminatedUnionParent {
    label: string;
    inner: { type: 'cat'; meow: string } | { type: 'dog'; /** @format int32 */ bark: number };
}

// ----------------------------------------------------------------------------
// Case 7: String-literal + ref union
// ----------------------------------------------------------------------------
// Exercises postProcessStringLiteralUnions — N inline literals plus exactly
// one $ref to a plain-string type become a Swift enum with an associated-
// value catch-all case.

export type RefStringValue = string;

export type StringLiteralRefUnion = 'staticA' | 'staticB' | RefStringValue;

// ----------------------------------------------------------------------------
// Case 8: Pure type alias to a ref
// ----------------------------------------------------------------------------
// Exercises postProcessTypeAliases — produces a Swift `typealias`.

export type TypeAliasToRef = DiscriminatedUnion;

// ----------------------------------------------------------------------------
// Case 9: Generic interface
// ----------------------------------------------------------------------------
// Exercises GenericInterfaceNodeParser + GenericInterfaceTypeFormatter.
// `value: T` becomes `x-generic-type-ref: "T"`; `x-generic-params: [{T}]`.

export interface GenericContainer<T> {
    value: T;
    /** @format int32 */
    count: number;
}

// ----------------------------------------------------------------------------
// Case 10: Constant fields (standalone single-literal property)
// ----------------------------------------------------------------------------
// Exercises postProcessConstantFields — `role: 'admin'` is lifted out of
// `properties` into `x-constant-fields` and emitted as a `public let` set
// in the Swift initializer body rather than a parameter.

export interface ConstantFieldsCase {
    role: 'admin';
    /** @format int32 */
    score: number;
}

// ----------------------------------------------------------------------------
// Case 11: @format frozen — opaque field
// ----------------------------------------------------------------------------
// Exercises AnnotatedTypeFormatterWithIntegers' frozen-format branch — the
// field becomes a `private let … : AnyCodable` in Swift.

export interface FrozenFormatCase {
    name: string;
    /** @format frozen */
    opaque: unknown;
}

// ----------------------------------------------------------------------------
// Case 12: All supported integer formats
// ----------------------------------------------------------------------------
// Exercises every entry of INTEGER_FORMATS (int, int8/16/32/64,
// uint, uint8/16/32/64, timestamp).

export interface IntegerFormatsCase {
    /** @format int */ intField: number;
    /** @format int8 */ int8Field: number;
    /** @format int16 */ int16Field: number;
    /** @format int32 */ int32Field: number;
    /** @format int64 */ int64Field: number;
    /** @format uint */ uintField: number;
    /** @format uint8 */ uint8Field: number;
    /** @format uint16 */ uint16Field: number;
    /** @format uint32 */ uint32Field: number;
    /** @format uint64 */ uint64Field: number;
    /** @format timestamp */ timestampField: number;
}

// ----------------------------------------------------------------------------
// Case 13: JSDoc descriptions
// ----------------------------------------------------------------------------
// Exercises JSDoc extraction on the type and its properties.

/** A model with descriptive JSDoc on the type and its fields. */
export interface JSDocDescribedModel {
    /** The user's full name. */
    name: string;
    /**
     * Age in years.
     * @format int32
     */
    age: number;
}

// ----------------------------------------------------------------------------
// Case 14: Discriminated union with a recursive reference
// ----------------------------------------------------------------------------
// Exercises the recursive-reference branch in DiscriminatedUnionNodeParser
// (the `isRecursive` path: a member's value type references the parent
// union, producing a `SyntheticValueType` wrapping an `ArrayType` of refs).

/** @discriminator type */
export type RecursiveUnion = RecursiveUnionLeaf | RecursiveUnionBranch;

export interface RecursiveUnionLeaf {
    type: 'leaf';
    value: string;
}

export interface RecursiveUnionBranch {
    type: 'branch';
    children: RecursiveUnion[];
}

// ----------------------------------------------------------------------------
// Case 14b: Discriminated union with NON-array recursive reference
// ----------------------------------------------------------------------------
// Like Case 14 but the recursive associated value is a single ref instead of
// an array. The variant uses the single-field-inline shape (one
// non-discriminator field named `value`) so the recursion lands on an enum
// case's associated value directly. Swift needs `indirect case` on that arm
// so the enum can hold itself.

/** @discriminator type */
export type RecursiveUnionDirect = RecursiveUnionDirectEmpty | RecursiveUnionDirectNested;

export interface RecursiveUnionDirectEmpty {
    type: 'empty';
}

export interface RecursiveUnionDirectNested {
    type: 'nested';
    value: RecursiveUnionDirect;
}

// ----------------------------------------------------------------------------
// Case 15: Property kinds — required / optional / nullable / array / dict / bool
// ----------------------------------------------------------------------------
// Bundled because each branch is small but distinct in the generator:
//   - optional `?:`         → omitted from `required[]`           → Swift `T?`
//   - nullable `T | null`   → included in required, nullable type → Swift `T?`
//   - array of primitive    → JSON `type: array, items: {…}`      → Swift `[T]`
//   - array of ref          → items is `$ref`                     → Swift `[TON…]`
//   - boolean primitive     → JSON `type: boolean`                → Swift `Bool`
//   - dictionary            → JSON `additionalProperties`         → Swift `[String: V]`

export interface PropertyKindsCase {
    requiredString: string;
    optionalString?: string;
    nullableString: string | null;
    /** @format int32 */
    requiredCount: number;
    isActive: boolean;
    tags: string[];
    nestedEnums: BasicNumericEnum[];
    metadata: { [key: string]: string };
}

// ----------------------------------------------------------------------------
// Case 16: TS enum with string raw values
// ----------------------------------------------------------------------------
// Distinct from BasicNumericEnum — the constant values flowing through
// `typeChecker.getConstantValue(member)` are strings, so the JSON schema is
// `type: "string"` (not `"number"`), and the generated Swift enum's raw
// value type is `String` (not `Double`).

export enum StringRawEnum {
    Ton = 'ton',
    Jetton = 'jetton',
    Nft = 'nft',
}

// ----------------------------------------------------------------------------
// Case 17: Pure type alias to a primitive
// ----------------------------------------------------------------------------
// ts-json-schema-generator typically inlines primitive aliases at every use
// site rather than emitting a top-level definition for them. Locking that
// behavior in: if this fixture ever starts producing a TON*.swift file, the
// generator behavior changed.

export type PrimitiveTypeAlias = string;

// ----------------------------------------------------------------------------
// Case 18: Generic interface with a default type parameter
// ----------------------------------------------------------------------------
// Per .local/code-generation-system.md: defaults are intentionally ignored
// (Swift has no equivalent). Fixture catches a regression that started
// honoring them.

export interface GenericWithDefault<TPayload = unknown> {
    /** @format int32 */
    id: number;
    payload: TPayload;
}

// ----------------------------------------------------------------------------
// Case 19: @format url on a string property
// ----------------------------------------------------------------------------
// Annotation passes through the schema as `format: "url"` but doesn't change
// the Swift type — exercises the annotation-passthrough code path without
// triggering integer/frozen handling.

export interface UrlFormatCase {
    name: string;
    /** @format url */
    aboutUrl: string;
    /** @format url */
    iconUrl?: string;
}

// ----------------------------------------------------------------------------
// Case 20: Properties that are $refs to enums (numeric and string raw types)
// ----------------------------------------------------------------------------
// Regression guard for the openapi-generator quirk where a property's
// vendorExtensions are INHERITED from the $ref target. For a property whose
// type is `$ref: SomeIntegerEnum`, the property ends up carrying the enum's
// `x-int-format-flags`. Without the `isEnumRef` short-circuit in
// `_swiftIntegerType.mustache`, the template would emit `Int` instead of the
// enum class name. Covers: required enum-ref, optional enum-ref, array of
// enum-refs, mix of int-raw and string-raw enums.

export interface EnumRefPropertiesCase {
    primary: BasicNumericEnum;
    secondary?: StringRawEnum;
    everyMode: BasicNumericEnum[];
    /** @format int32 */
    rawCount: number;
}

// ----------------------------------------------------------------------------
// Case 21: Pure string-literal union (no ref-as-catch-all)
// ----------------------------------------------------------------------------
// Distinct from `StringLiteralRefUnion` (Case 7) which mixes literals with
// one $ref. With zero refs, `postProcessStringLiteralUnions` doesn't fire
// and the default ts-json-schema-generator path emits a plain string enum.

export type PureStringLiteralUnion = 'alpha' | 'beta' | 'gamma';

// ----------------------------------------------------------------------------
// Case 22: Empty interface — no declared properties
// ----------------------------------------------------------------------------
// Edge case: openapi-generator typically collapses these into `AnyCodable`
// or a free-form object. Snapshot the current behaviour so a future template
// change is caught. An empty interface is intentional here — the rule
// triggered by it is what we're explicitly testing the generator on.

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface EmptyCase {}

// ----------------------------------------------------------------------------
// Case 23: Multi-parameter generic interface
// ----------------------------------------------------------------------------
// Extends Case 9 to two type parameters and exercises the JSDoc-format flow
// through `GenericInterfaceNodeParser` for non-generic siblings.

export interface MultiGenericContainer<K, V> {
    key: K;
    value: V;
    /** @format int32 */
    count: number;
}

// ----------------------------------------------------------------------------
// Case 24: Discriminated union with multi-field variants that carry @format
// ----------------------------------------------------------------------------
// Variant `a` has TWO non-discriminator fields → it stays as a separate
// `…WithFormatA` type with `@format int32` on `counter` (testing the
// member-type code path for integer formats). Variant `b` has ONE non-
// discriminator field with `@format uint16` → it's inlined as a single-
// field-variant case, exercising format-passthrough on the inlined arm.

/** @discriminator type */
export type DiscriminatedUnionWithFormat = DiscriminatedUnionWithFormatA | DiscriminatedUnionWithFormatB;

export interface DiscriminatedUnionWithFormatA {
    type: 'a';
    name: string;
    /** @format int32 */
    counter: number;
}

export interface DiscriminatedUnionWithFormatB {
    type: 'b';
    /** @format uint16 */
    code: number;
}

// ----------------------------------------------------------------------------
// Case 25: Generic instantiation property (single type argument)
// ----------------------------------------------------------------------------
// Exercises the x-generic-instance-type path in GenericInterfaceNodeParser:
// a property whose type is another generic type parameterized by THIS
// interface's own type param (`GenericContainer<TMeta>`). JSON Schema can't
// carry the type argument, so the parser records the raw Swift type text and
// the template re-attaches it (prefixed) → `TONGenericContainer<TMeta>`.
// Covers required + optional. The bare `label` keeps the non-generic path live.

export interface GenericInstanceContainer<TMeta> {
    inner: GenericContainer<TMeta>;
    optionalInner?: GenericContainer<TMeta>;
    label: string;
}

// ----------------------------------------------------------------------------
// Case 26: Generic instantiation with multiple type arguments
// ----------------------------------------------------------------------------
// Like Case 25 but the instantiated type takes two arguments, both of which
// are the parent's type params (`MultiGenericContainer<A, B>`) →
// `TONMultiGenericContainer<A, B>`. The `@format int32` sibling checks the
// integer-format path still fires alongside x-generic-instance-type.

export interface GenericInstanceMultiArg<A, B> {
    pair: MultiGenericContainer<A, B>;
    /** @format int32 */
    count: number;
}

// ----------------------------------------------------------------------------
// Case 27: Generic instantiation using a subset of the parent's type params
// ----------------------------------------------------------------------------
// The parent declares two type params but the instantiation uses only one
// (`GenericContainer<TUsed>`), while the other (`TUnused`) is consumed by a
// bare generic-type-ref property. Verifies that x-generic-instance-type emits
// exactly the used argument and coexists with x-generic-type-ref.

export interface GenericInstanceSubsetArg<TUsed, TUnused> {
    used: GenericContainer<TUsed>;
    spare: TUnused;
}
