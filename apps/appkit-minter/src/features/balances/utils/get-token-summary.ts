/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { Jetton } from '@ton/appkit';
import { getFormattedJettonInfo } from '@ton/appkit';

export interface TokenInfo {
    name?: string;
    symbol?: string;
    decimals?: number;
    balance: string;
    image?: string | null;
    address: string | null;
}

/**
 * Derive display info for either native TON or a jetton — pure helper feeding
 * `<TokenSummary>` and the modal's downstream transfer hooks.
 */
export const getTokenSummary = (
    tokenType: 'TON' | 'JETTON',
    tonBalance: string,
    jetton: Jetton | undefined,
): TokenInfo => {
    if (tokenType === 'TON') {
        return { name: 'Toncoin', symbol: 'TON', decimals: 9, balance: tonBalance, image: './ton.png', address: null };
    }
    if (!jetton) throw new Error('Jetton not found');
    return getFormattedJettonInfo(jetton);
};
