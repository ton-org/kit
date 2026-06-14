/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { BrowserContext, Page } from '@playwright/test';

export { TonConnectWidget } from './TonConnectWidget';
export { WalletApp } from './WalletApp';
export { launchPersistentContext, testWith } from './test';
export { getExtensionId } from './util';

import type { TonConnectWidget } from './TonConnectWidget';
import type { DemoWallet } from '../wallet';

export interface ConfigFixture {
    /** dApp under test — the appkit-minter URL (local dev server or deployed preview). */
    appUrl: string;
    /** Wallet source — demo-wallet URL (web) or extension path. Defaults via env. */
    walletSource?: string;
    /** Seed phrase imported into the demo wallet. Defaults to WALLET_MNEMONIC. */
    mnemonic?: string;
}

export type TestFixture = {
    context: BrowserContext;
    /** appkit-minter page (the dApp under test). */
    app: Page;
    /** TonConnect UI widget driver on the dApp side. */
    widget: TonConnectWidget;
    /** Demo wallet driver (second tab) — imports mnemonic, approves/rejects requests. */
    wallet: DemoWallet;
};
