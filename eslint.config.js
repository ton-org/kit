/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

const toolchainConfig = require('@ton/toolchain');
const globals = require('globals');
const licenseHeader = require('eslint-plugin-license-header');

module.exports = [
    ...toolchainConfig,
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                // ...globals.nodeBuiltin
            },
        },
        rules: {},
    },
    {
        ignores: [
            '**/dist/**',
            '**/dist-extension/**',
            '**/dist-extension-chrome/**',
            '**/dist-extension-firefox/**',
            '**/storybook-static/**',
            '**/coverage/**',
            '**/.turbo/**',
            '**/.next/**',
            '**/.cursor/**',
            '**/.cache/**',
            '**/.changeset/**',
            '**/*report*/**',
            '**/*stryker*/**',
            '**/allure-results/**',
            '**/playwright-report/**',
            '**/test-results/**',
            '**/Packages/TONWalletKit/**',
            '**/TONWalletApp/TONWalletApp/**',
            '**/androidkit/**',
            '**/next-env.d.ts',
            '**/analytics/swagger/generated.ts',
        ],
    },
    {
        files: ['**/**/*.ts', '**/**/*.tsx'],
        ignores: ['packages/create-ton-appkit/template-*/**'],
        plugins: {
            'license-header': licenseHeader,
        },
        rules: {
            'license-header/header': ['error', './resources/license-header.js'],
        },
    },
    {
        files: ['apps/demo-wallet-native/**/*.ts', 'apps/demo-wallet-native/**/*.tsx'],
        rules: {
            '@typescript-eslint/no-require-imports': 'off',
        },
    },
    {
        files: ['demo/examples/**/*.ts', 'scripts/**/*.ts'],
        rules: {
            'no-console': 'off',
        },
    },
    {
        files: ['**/**/*.ts', '**/**/*.tsx'],
        // plugins: {
        //     import: importPlugin,
        // },
        rules: {
            'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
            '@typescript-eslint/consistent-type-imports': [
                'error',
                { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
            ],
        },
    },
];
