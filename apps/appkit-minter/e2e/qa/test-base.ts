/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { test as base } from '@playwright/test';

import { captureConsole, attachConsoleOnFailure } from './diagnostics';

/**
 * Base test for wallet-less specs (those that drive the built-in `page` directly).
 * Adds an auto fixture that captures the page's browser console and attaches it to
 * the report on failure. Wallet-based specs get the same treatment via the
 * two-tab fixture's `app` page.
 */
export const test = base.extend<{ _console: void }>({
    _console: [
        async ({ page }, use, testInfo) => {
            const logs = captureConsole(page);
            await use();
            await attachConsoleOnFailure(testInfo, logs);
        },
        { auto: true },
    ],
});

export { expect } from '@playwright/test';
