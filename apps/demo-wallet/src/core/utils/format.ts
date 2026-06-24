/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { formatUnits } from '@ton/walletkit';

const usd = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const usdSmall = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 });

/** Raw token units (nanotons / jetton base units) → a JS number in whole tokens. */
export const toDecimal = (raw: bigint | string | undefined, decimals: number): number => {
    if (raw === undefined || raw === '') return 0;
    try {
        return Number(formatUnits(raw, decimals));
    } catch {
        return 0;
    }
};

/** Per-unit price → `$`, with extra precision for sub-cent values. */
export const formatRate = (value: number): string => `$${(value >= 0.01 ? usd : usdSmall).format(value)}`;
