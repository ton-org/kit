/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { Page, Locator } from '@playwright/test';

/**
 * Page object for the appkit-minter dApp. Wraps the navigation, the jetton/GRAM
 * transfer modal (with its gasless controls) and the NFT mint flow
 * (settings → confirm → low-balance modals).
 *
 * Selectors lean on visible text / roles and a couple of stable structural hooks,
 * since the minter does not yet expose dedicated data-testid attributes.
 */
export class MinterPage {
    constructor(private readonly page: Page) {}

    // ---- navigation ----

    async gotoMint(): Promise<void> {
        await this.page
            .getByRole('button', { name: /^Mint$/ })
            .first()
            .click();
    }

    async gotoJettons(): Promise<void> {
        await this.page
            .getByRole('button', { name: /^Jettons$/ })
            .first()
            .click();
    }

    // ---- transfer modal ----

    /**
     * Opens the transfer modal for a token by its id — `'ton'` for the native Gram,
     * or the jetton master address (e.g. `USDT_MASTER`). Targets the `token-row-<id>`
     * testid that {@link JettonCard} sets on each asset row, so it never collides with
     * the sidebar balance / ticker text the way a visible-name match would.
     */
    async openTransfer(tokenId: 'ton' | string): Promise<void> {
        await this.gotoJettons();
        await this.page.getByTestId(`token-row-${tokenId}`).click();
        await this.transferModalTitle.waitFor({ state: 'visible' });
    }

    get transferModalTitle(): Locator {
        return this.page.getByText(/Transfer /i).first();
    }

    get gaslessCheckbox(): Locator {
        return this.page.locator('input[type="checkbox"]').first();
    }

    get gaslessLabel(): Locator {
        return this.page.getByText(/Gasless — pay the gas fee in another token/i);
    }

    get noSignMessageHint(): Locator {
        return this.page.getByText(/does not support gasless \(no SignMessage feature\)/i);
    }

    get recipientInput(): Locator {
        return this.page.getByPlaceholder(/Enter TON address/i);
    }

    get amountInput(): Locator {
        return this.page.getByPlaceholder('0.00');
    }

    get commentInput(): Locator {
        return this.page.getByPlaceholder(/Add a comment/i);
    }

    get feeAssetSelect(): Locator {
        return this.page.locator('select').first();
    }

    /** The primary send button — "Send {symbol}" / "Send Gasless" / "Quoting…" / "Sending…". */
    get sendButton(): Locator {
        return this.page
            .locator('button')
            .filter({ hasText: /Send |Quoting|Sending/i })
            .first();
    }

    async enableGasless(): Promise<void> {
        const cb = this.gaslessCheckbox;
        if (!(await cb.isChecked())) {
            await cb.check();
        }
    }

    async fillTransfer(recipient: string, amount: string, comment?: string): Promise<void> {
        await this.recipientInput.fill(recipient);
        await this.amountInput.fill(amount);
        if (comment !== undefined) {
            await this.commentInput.fill(comment);
        }
    }

    /** Reads the "Gas fee: …" line text (or null if absent). */
    async gasFeeText(): Promise<string | null> {
        const body = await this.page.evaluate(() => document.body.innerText);
        return body.match(/Gas fee:[^\n]*/i)?.[0] ?? null;
    }

    // ---- mint flow ----

    /**
     * Generate a card so the mint action + settings buttons appear. Client-side,
     * no wallet needed. The primary action reads "Mint NFT" once a wallet is
     * connected and "Connect Wallet" otherwise — so we wait on the generator
     * button flipping to "Generate new card", which is wallet-independent.
     */
    async generateCard(): Promise<void> {
        await this.gotoMint();
        // The generator button reads "Generate card" with no card and "Generate new
        // card" once one exists (the minter seeds/persists a card across loads), so
        // match either. A card being present is confirmed by the gear button showing.
        await this.page
            .getByRole('button', { name: /Generate (new )?card/i })
            .first()
            .click();
        await this.mintSettingsButton.waitFor({ state: 'visible' });
    }

    get mintNftButton(): Locator {
        return this.page.getByRole('button', { name: /Mint NFT/i }).first();
    }

    /**
     * The icon-only (gear) settings button next to the mint action. It carries no
     * text or aria-label, so we match the only text-less button with an svg —
     * which works whether the sibling reads "Mint NFT" or "Connect Wallet".
     */
    get mintSettingsButton(): Locator {
        return this.page
            .locator('button')
            .filter({ hasNotText: /\S/ })
            .filter({ has: this.page.locator('svg') })
            .last();
    }

    get gaslessSwitch(): Locator {
        return this.page.locator('button[role="switch"]').first();
    }

    /** Opens the Mint settings dialog. Assumes a card has been generated (gear is shown). */
    async openMintSettings(): Promise<void> {
        await this.mintSettingsButton.waitFor({ state: 'visible' });
        await this.mintSettingsButton.click();
        await this.page.getByText(/Mint settings/i).waitFor({ state: 'visible' });
    }

    async setMintGasless(enabled: boolean): Promise<void> {
        await this.openMintSettings();
        const sw = this.gaslessSwitch;
        const isOn = (await sw.getAttribute('aria-checked')) === 'true';
        if (isOn !== enabled && !(await sw.isDisabled())) {
            await sw.click();
        }
        await this.page
            .getByRole('button', { name: /^Save$/ })
            .first()
            .click();
    }

    /** Opens the Confirm-mint dialog. Assumes a card has been generated and a wallet connected. */
    async openMintConfirm(): Promise<void> {
        await this.mintNftButton.click();
        await this.page.getByText(/Confirm mint/i).waitFor({ state: 'visible' });
    }

    get confirmButton(): Locator {
        return this.page.getByRole('button', { name: /^Confirm$/ }).first();
    }

    // Confirm-mint modal gasless rows (rendered only when gasless is enabled).
    get confirmProviderRow(): Locator {
        return this.page.getByText(/^Provider$/i).first();
    }

    get confirmFeeAssetRow(): Locator {
        return this.page.getByText(/^Fee asset$/i).first();
    }

    get confirmGasFeeRow(): Locator {
        return this.page.getByText(/^Gas fee$/i).first();
    }

    /** The fee-asset <select> inside an open Confirm-mint modal. */
    get mintFeeAssetSelect(): Locator {
        return this.page.locator('select').first();
    }

    // ---- low-balance modal (regular mint, insufficient TON) ----

    get lowBalanceTitle(): Locator {
        return this.page.getByText(/Not enough TON/i);
    }

    get switchToGaslessButton(): Locator {
        return this.page.getByRole('button', { name: /Switch to gasless/i });
    }

    get lowBalanceCloseButton(): Locator {
        return this.page.getByRole('button', { name: /^Close$/ });
    }

    // ---- shared ----

    get errorText(): Locator {
        return this.page.locator('.text-error, [class*="error"]');
    }

    async closeModals(): Promise<void> {
        for (let i = 0; i < 4; i++) {
            const cancel = this.page.getByRole('button', { name: /^Close$|^Cancel$|^Done$/ });
            if (await cancel.count()) {
                await cancel
                    .first()
                    .click()
                    .catch(() => undefined);
            } else {
                await this.page.keyboard.press('Escape').catch(() => undefined);
            }
            await this.page.waitForTimeout(200);
        }
    }
}
