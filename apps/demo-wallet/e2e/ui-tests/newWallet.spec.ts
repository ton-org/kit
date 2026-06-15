/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { expect } from '@playwright/test';

import { testWithUIFixture } from './UITestFixture';
import { TEST_PASSWORD } from '../constants';
import { SetupWalletPage } from '../pages';

const test = testWithUIFixture();

test.describe('New Wallet Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Welcome → "Create a new wallet" → set a password → land on the Recovery phrase screen.
        await page.getByTestId('welcome-create').click();
        await page.getByTestId('password').fill(TEST_PASSWORD);
        await page.getByTestId('password-confirm').fill(TEST_PASSWORD);
        await page.getByTestId('password-submit').click();
        await page.getByTestId('reveal-mnemonic').waitFor({ state: 'visible' });
    });

    test('Create new wallet on Mainnet', async ({ page }) => {
        const setupWallet = new SetupWalletPage(page);

        // Mainnet is selected by default.
        await expect(page.getByTestId('network-select-mainnet')).toBeEnabled();

        await page.getByTestId('reveal-mnemonic').click();

        await expect(page.getByTestId('mnemonic-grid')).toBeVisible();
        await expect(page.getByTestId('mnemonic-word-1')).toBeVisible();

        // Continue → "Have you saved it?" modal → hold-to-continue.
        await setupWallet.confirmAndCreate();

        // The settings button only exists on the wallet dashboard.
        await expect(page.getByTestId('wallet-menu')).toBeVisible();
    });

    test('Create new wallet on Testnet', async ({ page }) => {
        const setupWallet = new SetupWalletPage(page);

        await page.getByTestId('network-select-testnet').click();
        await expect(page.getByTestId('network-select-testnet')).toBeEnabled();

        await page.getByTestId('reveal-mnemonic').click();

        await expect(page.getByTestId('mnemonic-grid')).toBeVisible();
        await expect(page.getByTestId('mnemonic-word-1')).toBeVisible();

        await setupWallet.confirmAndCreate();

        await expect(page.getByTestId('wallet-menu')).toBeVisible();
    });

    test('Cannot proceed without saving confirmation', async ({ page }) => {
        const setupWallet = new SetupWalletPage(page);

        // Continue is disabled until the recovery phrase has been revealed.
        await expect(setupWallet.continueButton).toBeDisabled();

        await page.getByTestId('reveal-mnemonic').click();

        await expect(setupWallet.continueButton).toBeEnabled();

        // Continue only opens the confirmation modal — it doesn't create the wallet.
        await setupWallet.openConfirm();
        await expect(setupWallet.holdToContinue).toBeVisible();

        // A short tap is not enough; the gesture must be held to confirm.
        await setupWallet.tapHold();
        await expect(page.getByTestId('wallet-menu')).toBeHidden();
        await expect(setupWallet.holdToContinue).toBeVisible();
    });
});
