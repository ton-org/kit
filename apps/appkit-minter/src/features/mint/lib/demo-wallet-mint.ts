/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { CardData } from '../types/card';

import { DEMO_WALLET_APP_URL } from '@/features/connect-wallet';

/**
 * The NFT being minted, as understood by both apps. Serialized into the demo
 * wallet's `asset` query param so its confirm modal can render the real NFT
 * (name + art) and the exact gasless fee instead of hard-coded placeholders.
 */
export interface MintAsset {
    /** Display name of the NFT, e.g. "Storm Drake". */
    name: string;
    /** Image URL (the card's inline SVG data URL). */
    image?: string;
    /** Pre-formatted gasless fee the relayer charges, e.g. "0.024594 USDT". */
    fee?: string;
}

/** Build the mint asset descriptor for a generated card and its quoted fee. */
export const buildMintAsset = (card: CardData, fee?: string): MintAsset => ({
    name: card.name,
    image: card.imageUrl,
    ...(fee ? { fee } : {}),
});

/**
 * URL that reopens the demo wallet to approve a mint. Carries `ret` (so the
 * wallet returns the user here afterward) and `asset` (the NFT + fee the wallet
 * renders in its confirm modal).
 */
export const buildDemoWalletMintUrl = (card: CardData, fee?: string): string => {
    const url = new URL(DEMO_WALLET_APP_URL);
    url.searchParams.set('ret', window.location.href);
    url.searchParams.set('asset', JSON.stringify(buildMintAsset(card, fee)));
    return url.toString();
};
