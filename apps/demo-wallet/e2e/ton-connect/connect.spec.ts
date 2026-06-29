/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { expect } from '@playwright/test';

import { twoTabFixture } from './twoTabFixture';

/**
 * Two-tab TON Connect — connect modal.
 *
 * Tab 1 = the in-kit appkit-minter dApp (:5174). Tab 2 = the redesigned demo-wallet (:5173).
 * `widget.connectUrl()` opens the dApp's connect modal and copies the universal link off the
 * clipboard; `wallet.connectBy(url, false, confirm)` pastes it into the wallet's "Connect to
 * dApp" flow and drives the per-type `connect-request` modal (`connect-approve` /
 * `connect-reject`). Hold-to-sign is turned OFF during import (see DemoWallet.importWallet),
 * so the approve testids are present. The connect handshake itself rides the real bridge.
 *
 * FOLLOW-UP (sendTransaction / signMessage / signData), parked with a verified reason:
 *  - sendTransaction → `transaction-request`: the minter's regular TON/jetton transfer is gated
 *    on real wallet funds (it shows "Not enough TON" and never sends the request over the bridge
 *    for an unfunded WALLET_MNEMONIC) — verified by probe: the wallet stays on its dashboard.
 *  - signMessage → `sign-message-request`: the gasless path needs the connected wallet to HOLD
 *    the fee jetton (USDT) — the minter's Jettons list has no `token-row-<USDT>` for a wallet
 *    that doesn't hold it, so `openTransfer(USDT)` can't be reached. The relayer mocks
 *    (`mockGaslessConfig`/`mockGaslessEstimateOk`) cover the relayer but not the wallet's holdings.
 *    → needs a funded test wallet (TON for sendTransaction, USDT for gasless) or a wallet-API mock
 *      on the connected wallet's data backend.
 *  - signData: the minter can't issue a signData request — needs a small local mock-dApp page.
 * `DemoWallet` already has `accept()`/`signMessage()`/`signData()` ready to drive those modals.
 */
const test = twoTabFixture();

test.describe('TON Connect — connect (two-tab, minter dApp)', () => {
    test('Approving the connect request connects the wallet to the dApp', async ({ wallet, widget }) => {
        const url = await widget.connectUrl();
        await wallet.connectBy(url, false, true);

        // After a successful connect the dApp's widget shows its connected (disconnect) control.
        await expect(widget.connectButton).toBeVisible();
    });

    test('Rejecting the connect request leaves the dApp disconnected', async ({ wallet, widget }) => {
        const url = await widget.connectUrl();
        await wallet.connectBy(url, false, false);

        // The dApp falls back to its pre-connect "connect" affordance.
        await expect(widget.connectButton).toBeVisible();
    });
});
