/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        include: ['src/**/*.integration.spec.ts'],
        fileParallelism: false,
        testTimeout: 120_000,
        hookTimeout: 120_000,
    },
});
