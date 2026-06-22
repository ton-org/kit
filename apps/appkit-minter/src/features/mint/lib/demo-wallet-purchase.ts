/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { getMintPrice, MINT_PRICE_SYMBOL } from '../constants/mint-price';
import type { CardData } from '../types/card';

import { DEMO_WALLET_APP_URL } from '@/features/connect-wallet';

/**
 * The asset being purchased, as understood by both apps. Serialized into the
 * demo wallet's `asset` query param so its confirm modal can render the real
 * NFT (name + art) and the exact price instead of hard-coded placeholders.
 */
export interface PurchaseAsset {
    /** Display name of the NFT, e.g. "Storm Drake". */
    name: string;
    /** Image URL (the card's inline SVG data URL). */
    image?: string;
    /** Numeric sale price. */
    amount: number;
    /** Ticker the price is denominated in, e.g. "USDT". */
    symbol: string;
}

/** Build the purchase asset descriptor for a generated card. */
export const buildPurchaseAsset = (card: CardData): PurchaseAsset => ({
    name: card.name,
    image: card.imageUrl,
    amount: getMintPrice(card.rarity),
    symbol: MINT_PRICE_SYMBOL,
});

/**
 * URL that reopens the demo wallet to approve a mint. Carries `ret` (so the
 * wallet returns the user here afterward) and `asset` (the NFT details the
 * wallet renders in its confirm modal).
 */
export const buildDemoWalletPurchaseUrl = (card: CardData): string => {
    const url = new URL(DEMO_WALLET_APP_URL);
    url.searchParams.set('ret', window.location.href);
    url.searchParams.set('asset', JSON.stringify(buildPurchaseAsset(card)));
    return url.toString();
};
