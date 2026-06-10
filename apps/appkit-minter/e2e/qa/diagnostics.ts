/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { Page, TestInfo } from '@playwright/test';

/**
 * Start collecting browser console output + uncaught page errors for `page`.
 * Returns the live buffer; pair with {@link attachConsoleOnFailure} in teardown.
 */
export function captureConsole(page: Page): string[] {
    const logs: string[] = [];
    page.on('console', (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));
    page.on('pageerror', (err) => logs.push(`[pageerror] ${err.message}`));
    return logs;
}

/**
 * On a failed (or unexpectedly-passed) test, attach the collected console buffer
 * to the report. Playwright already attaches the failure screenshot + trace
 * (screenshot/trace config), so allure-playwright surfaces all three in TestOps.
 */
export async function attachConsoleOnFailure(testInfo: TestInfo, logs: string[]): Promise<void> {
    if (testInfo.status !== testInfo.expectedStatus && logs.length > 0) {
        await testInfo.attach('browser-console.log', {
            body: logs.join('\n'),
            contentType: 'text/plain',
        });
    }
}
