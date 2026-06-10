/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { expect } from '@playwright/test';

import { testWithGaslessFixture, connectWallet } from '../fixtures/gaslessFixture';
import { gaslessMeta } from '../qa/allure-meta';
import { mockGaslessConfig, mockGaslessEstimateOk, USDT_MASTER } from '../mocks/gaslessRelayer';

/** A second relayer-accepted fee asset (NOT master) — for the fee-asset switch. */
const NOT_MASTER = 'EQAvlWFDxGF2lXm67y4yzC17wYKD9A0guwPkMs1gOsM__NOT';

/**
 * §9 — additional gasless-mint flow states (no send). Relayer is mocked.
 */
const test = testWithGaslessFixture({
    appUrl: process.env.MINTER_URL ?? 'http://localhost:5174/',
});

test.describe('Gasless Mint — additional states', () => {
    test('With Gasless disabled the Confirm dialog shows only the Owner row', async ({
        app,
        minter,
        widget,
        wallet,
    }) => {
        await gaslessMeta('Mint', '§9.6');
        await test.step('Connect wallet, generate card and open Confirm (Gasless disabled)', async () => {
            await connectWallet({ widget, wallet });
            await minter.generateCard();
            await minter.openMintConfirm();
        });
        await test.step('Owner row is visible, Provider / Fee asset / Gas fee rows are absent', async () => {
            await expect(app.getByText(/^Owner$/i).first()).toBeVisible();
            await expect(minter.confirmProviderRow).toHaveCount(0);
            await expect(minter.confirmFeeAssetRow).toHaveCount(0);
            await expect(minter.confirmGasFeeRow).toHaveCount(0);
        });
    });

    test('Gasless setting persists when mint settings are reopened', async ({
        app,
        minter,
        widget,
        wallet,
    }) => {
        await gaslessMeta('Mint', '§9.16');
        await mockGaslessConfig(app, { assets: [USDT_MASTER] });
        await mockGaslessEstimateOk(app);
        await test.step('Connect wallet, generate card and enable Gasless in settings', async () => {
            await connectWallet({ widget, wallet });
            await minter.generateCard();
            await minter.setMintGasless(true);
        });
        await test.step('Reopen mint settings — Gasless switch is enabled', async () => {
            await minter.openMintSettings();
            await expect(minter.gaslessSwitch).toHaveAttribute('aria-checked', 'true');
        });
    });

    test('Changing the fee asset in Confirm updates the selected value', async ({ app, minter, widget, wallet }) => {
        await gaslessMeta('Mint', '§9.8');
        await mockGaslessConfig(app, { assets: [USDT_MASTER, NOT_MASTER] });
        await mockGaslessEstimateOk(app);
        await test.step('Connect wallet, generate card, enable Gasless and open Confirm', async () => {
            await connectWallet({ widget, wallet });
            await minter.generateCard();
            await minter.setMintGasless(true);
            await minter.openMintConfirm();
        });
        await test.step('Switch the fee asset → the selector reflects the new asset', async () => {
            await expect(minter.mintFeeAssetSelect).toBeVisible();
            await minter.mintFeeAssetSelect.selectOption(NOT_MASTER);
            await expect(minter.mintFeeAssetSelect).toHaveValue(NOT_MASTER);
        });
    });

    test('Cancelling Mint settings without Save keeps the previous state', async ({ app, minter, widget, wallet }) => {
        await gaslessMeta('Mint', '§9.4');
        await mockGaslessConfig(app, { assets: [USDT_MASTER] });
        await test.step('Connect wallet, generate card, open Mint settings', async () => {
            await connectWallet({ widget, wallet });
            await minter.generateCard();
            await minter.openMintSettings();
        });
        await test.step('Toggle Gasless on, then close WITHOUT Save (Escape)', async () => {
            await minter.gaslessSwitch.click();
            await expect(minter.gaslessSwitch).toHaveAttribute('aria-checked', 'true');
            await app.keyboard.press('Escape');
        });
        await test.step('Reopen Mint settings — Gasless is still off (change was not saved)', async () => {
            await minter.openMintSettings();
            await expect(minter.gaslessSwitch).toHaveAttribute('aria-checked', 'false');
        });
    });

    test('Confirm is blocked while the gas-fee quote is loading', async ({ app, minter, widget, wallet }) => {
        await gaslessMeta('Mint', '§9.9');
        await mockGaslessConfig(app, { assets: [USDT_MASTER] });
        await mockGaslessEstimateOk(app, { delayMs: 4000 }); // slow quote → confirm stays disabled while loading
        await test.step('Connect wallet, generate card, enable Gasless and open Confirm', async () => {
            await connectWallet({ widget, wallet });
            await minter.generateCard();
            await minter.setMintGasless(true);
            await minter.openMintConfirm();
        });
        await test.step('Confirm is disabled during the quote load', async () => {
            await expect(minter.confirmButton).toBeDisabled();
        });
        await test.step('Once the quote arrives Confirm becomes enabled', async () => {
            await expect(minter.confirmButton).toBeEnabled();
        });
    });
});
