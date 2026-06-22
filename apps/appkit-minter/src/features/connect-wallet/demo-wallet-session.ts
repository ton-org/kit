/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * Tracks whether the active connection was made through the demo wallet.
 *
 * The demo wallet reports itself as "Tonkeeper" over TON Connect, so it can't be
 * told apart from a real wallet by its device info. Instead we remember the
 * user's choice at connect time: picking the demo tile sets the flag, picking
 * any other wallet clears it. The flag is persisted (localStorage) so it
 * survives a reload that restores the connection. It lets the mint flow know it
 * must reopen the demo wallet for approvals — unlike a mobile wallet, it isn't
 * running in the background to receive bridge requests.
 */
const DEMO_WALLET_SESSION_KEY = 'minter:connected-via-demo-wallet';

/** Mark the current connection as going through the demo wallet. */
export function markConnectedViaDemoWallet(): void {
    window.localStorage.setItem(DEMO_WALLET_SESSION_KEY, '1');
}

/** Clear the flag — the user connected (or is connecting) a different wallet. */
export function clearConnectedViaDemoWallet(): void {
    window.localStorage.removeItem(DEMO_WALLET_SESSION_KEY);
}

/** Whether the active connection was made through the demo wallet. */
export function isConnectedViaDemoWallet(): boolean {
    return window.localStorage.getItem(DEMO_WALLET_SESSION_KEY) === '1';
}
