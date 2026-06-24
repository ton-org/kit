/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/** Ways to add a wallet, shared across the wallet-setup entry points. */
export type WalletSetupMode = 'create' | 'import' | 'ledger';

/** Single source of truth mapping a setup mode to its dedicated route. */
export const WALLET_SETUP_ROUTE: Record<WalletSetupMode, string> = {
    create: '/create-wallet',
    import: '/import-wallet',
    ledger: '/ledger',
};
