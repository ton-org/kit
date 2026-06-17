/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { config } from 'dotenv';
import { defineConfig, devices } from '@playwright/test';

// Local convenience: load .env (WALLET_MNEMONIC, MINTER_URL, …). In CI these come
// from GitHub Actions secrets.
config({ quiet: true });

const workersCount = process.env.WORKERS_COUNT ? parseInt(process.env.WORKERS_COUNT) : undefined;
const timeout = process.env.TIMEOUT ? parseInt(process.env.TIMEOUT) : 60_000;
const headless =
    process.env.ENABLE_HEADLESS === 'true' ? true : process.env.ENABLE_HEADLESS === 'false' ? false : undefined;

const APP_URL = process.env.MINTER_URL ?? 'http://localhost:5174/';
const WALLET_SOURCE = process.env.E2E_WALLET_SOURCE ?? 'http://localhost:5173/';

// Two-tab specs need the demo wallet served too; start it locally unless a
// wallet source is pointed elsewhere. No-wallet specs ignore it.
const minterServer = process.env.MINTER_URL
    ? []
    : [
          {
              command: 'pnpm --filter appkit-minter dev',
              url: 'http://localhost:5174/',
              reuseExistingServer: !process.env.CI,
              timeout: 120_000,
          },
      ];
const walletServer = WALLET_SOURCE.includes('localhost:5173')
    ? [
          {
              command: 'pnpm --filter demo-wallet dev',
              url: 'http://localhost:5173/',
              reuseExistingServer: !process.env.CI,
              timeout: 120_000,
          },
      ]
    : [];

export default defineConfig({
    testDir: './e2e/specs',
    timeout,
    expect: { timeout },
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: workersCount,
    reporter: [
        ['list'],
        ['html', { open: 'never' }],
        // `detail: false` drops Playwright's auto hook/fixture/low-level steps from the
        // Allure tree, so TestOps shows only our explicit `test.step(...)` steps — no
        // "Before Hooks / Fixture" noise. Screenshots (on failure) + traces are still
        // attached automatically; browser console is attached by the fixtures below.
        ['allure-playwright', { detail: false, resultsDir: 'allure-results' }],
    ],
    use: {
        baseURL: APP_URL,
        screenshot: 'only-on-failure',
        trace: 'retain-on-failure',
        permissions: ['clipboard-read', 'clipboard-write'],
        launchOptions: {
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--no-first-run',
                '--disable-infobars',
                '--disable-blink-features=AutomationControlled',
            ],
        },
        headless,
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    // Boots the appkit-minter (5174) and, for two-tab specs, the demo wallet (5173).
    webServer: [...minterServer, ...walletServer],
});
