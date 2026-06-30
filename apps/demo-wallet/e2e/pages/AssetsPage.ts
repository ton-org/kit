/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { Page } from '@playwright/test';

/**
 * The `/wallet/assets` screen — the full token list (GRAM row first, then jettons
 * sorted by fiat desc). Rows render without data-testids (see `asset-row.tsx`), so
 * locators key on the visible name / symbol / role.
 */
export class AssetsPage {
    constructor(private readonly page: Page) {}

    /** The "Assets" screen header (ScreenHeader title). */
    get heading() {
        return this.page.getByRole('heading', { name: 'Assets' });
    }

    /** The native GRAM row's name cell ("Gram"). */
    get gramName() {
        return this.page.getByText('Gram', { exact: true }).first();
    }

    /** The GRAM row icon (`/gram.svg`). */
    get gramIcon() {
        return this.page.locator('img[src="/gram.svg"]').first();
    }

    /** A row located by its asset name (e.g. "Tether USD"). */
    nameCell(name: string) {
        return this.page.getByText(name, { exact: true }).first();
    }

    /** A FallbackImage gradient circle's two-letter text (shown when every icon URL fails). */
    fallbackText(text: string) {
        return this.page.getByText(text, { exact: true });
    }

    async waitForPage() {
        await this.heading.waitFor({ state: 'visible' });
    }
}
