/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { config } from 'dotenv';
import type { BrowserContext, Page } from '@playwright/test';
import { test as base } from '@playwright/test';

import { launchPersistentContext, TonConnectWidget } from '../qa';
import { DemoWallet } from '../demo-wallet';

config({ quiet: true });

/**
 * Self-contained two-tab TON Connect fixture for the redesigned demo-wallet.
 *
 * Why its own fixture (not the shared `demoWalletFixture`): this one pairs the **in-kit
 * appkit-minter** dApp (tab 1, :5174) — a local, CI-friendly TON Connect dApp — with the
 * demo-wallet (tab 2, :5173), and instantiates the two pages in a deterministic order
 * (dApp first, then import the wallet) so neither setup races the other.
 *
 *  - `context`  — one persistent BrowserContext shared by both tabs (matches the minter harness).
 *  - `app`      — the minter dApp Page (tab 1).
 *  - `widget`   — the dApp's TON Connect widget driver (copies the universal link from its modal).
 *  - `wallet`   — the demo-wallet driver (tab 2). Imports `WALLET_MNEMONIC` and turns hold-to-sign
 *                 OFF, so the per-type approve testids are present.
 *
 * The connect handshake rides the real TON Connect bridge (as the existing demo-wallet
 * connect.spec and the minter gasless e2e both do); only the wallet's data API would be mocked.
 */
export interface TwoTabFixture {
    context: BrowserContext;
    app: Page;
    widget: TonConnectWidget;
    wallet: DemoWallet;
}

export interface TwoTabConfig {
    appUrl?: string;
    walletSource?: string;
    mnemonic?: string;
}

export function twoTabFixture(cfg: TwoTabConfig = {}) {
    const appUrl = cfg.appUrl ?? process.env.MINTER_URL ?? 'http://localhost:5174/';
    const walletSource = cfg.walletSource ?? process.env.E2E_WALLET_SOURCE ?? 'http://localhost:5173/';
    const mnemonic = cfg.mnemonic ?? process.env.WALLET_MNEMONIC ?? '';

    return base.extend<TwoTabFixture>({
        // eslint-disable-next-line no-empty-pattern
        context: async ({}, use) => {
            const context = await launchPersistentContext('');
            await use(context);
            await context.close();
        },
        app: async ({ context }, use) => {
            const app = await context.newPage();
            await app.goto(appUrl, { waitUntil: 'load' });
            await use(app);
        },
        widget: async ({ app }, use) => {
            await use(new TonConnectWidget(app));
        },
        // Depends on `app` so the dApp tab is opened first; then import the wallet on its own tab.
        wallet: async ({ context, app: _app }, use) => {
            const wallet = new DemoWallet(context, walletSource);
            await wallet.importWallet(mnemonic);
            await use(wallet);
        },
    });
}
