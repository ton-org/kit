/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { config } from 'dotenv';
import { defineConfig, devices } from '@playwright/test';

// Two-tab TON Connect config: pairs the in-kit appkit-minter dApp (tab 1, :5174) with the
// redesigned demo-wallet (tab 2, :5173). The demo-wallet connects to the dApp over the real
// TON Connect bridge by pasting the universal link copied from the dApp's connect modal —
// the same pattern the appkit-minter gasless e2e uses. Mirrors `apps/appkit-minter/e2e.config.ts`.
config({ quiet: true });

const workersCount = process.env.WORKERS_COUNT ? parseInt(process.env.WORKERS_COUNT) : undefined;
const timeout = process.env.TIMEOUT ? parseInt(process.env.TIMEOUT) : 60_000;
const headless =
    process.env.ENABLE_HEADLESS === 'true' ? true : process.env.ENABLE_HEADLESS === 'false' ? false : undefined;

const APP_URL = process.env.MINTER_URL ?? 'http://localhost:5174/';
const WALLET_SOURCE = process.env.E2E_WALLET_SOURCE ?? 'http://localhost:5173/';

// Start the minter (tab 1) unless an external MINTER_URL is supplied.
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
// Start the demo-wallet (tab 2) unless it is served elsewhere.
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
    testDir: './e2e/ton-connect',
    timeout,
    expect: { timeout },
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    // Two-tab connect rides the real TON Connect bridge; CI retries absorb transient bridge/timing
    // hiccups (matches apps/appkit-minter/e2e.config.ts — that's why its two-tab gate is stable).
    retries: process.env.CI ? 2 : 0,
    workers: workersCount ?? 1,
    reporter: [['list'], ['allure-playwright']],
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
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
    webServer: [...minterServer, ...walletServer],
});
