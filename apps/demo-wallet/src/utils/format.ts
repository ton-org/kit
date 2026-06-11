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
const amount = new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 });

/** Raw token units (nanotons / jetton base units) → a JS number in whole tokens. */
export const toDecimal = (raw: bigint | string | undefined, decimals: number): number => {
    if (raw === undefined || raw === '') return 0;
    try {
        return Number(formatUnits(raw, decimals));
    } catch {
        return 0;
    }
};

/** USD value → `$1,234.56`. */
export const formatUsd = (value: number): string => `$${usd.format(value)}`;

/** USD value split into integer and fraction parts (no `$`), for styled rendering. */
export const formatUsdParts = (value: number): { intPart: string; fracPart: string } => {
    const [intPart, fracPart = '00'] = usd.format(value).split('.');
    return { intPart, fracPart };
};

/** Token amount → grouped string with up to 4 fraction digits, trailing zeros trimmed. */
export const formatAmount = (value: number): string => amount.format(value);

/** Per-unit price → `$`, with extra precision for sub-cent values. */
export const formatRate = (value: number): string => `$${(value >= 0.01 ? usd : usdSmall).format(value)}`;

/** Signed percentage → `+1.23%` / `-4.56%`. */
export const formatPercent = (value: number): string => `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
