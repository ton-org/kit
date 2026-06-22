/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { RarityValues } from '../types/card';
import type { Rarity } from '../types/card';

/** Stablecoin the demo NFTs are priced in. */
export const MINT_PRICE_SYMBOL = 'USDT';

/**
 * Demo sale price (in {@link MINT_PRICE_SYMBOL}) per rarity. The connected
 * wallet shows this amount in its purchase-confirmation modal, so the figure
 * the user approves matches the asset they're actually minting.
 */
export const MINT_PRICE_BY_RARITY: Record<Rarity, number> = {
    [RarityValues.Common]: 10,
    [RarityValues.Rare]: 25,
    [RarityValues.Epic]: 50,
    [RarityValues.Legendary]: 100,
};

/** Sale price for a card of the given rarity. */
export const getMintPrice = (rarity: Rarity): number => MINT_PRICE_BY_RARITY[rarity];
