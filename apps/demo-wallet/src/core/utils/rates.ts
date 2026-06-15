/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { compareAddress } from '@ton/walletkit';
import type { RateEntry } from '@demo/wallet-core';

/**
 * Look up a rate by address, tolerant of address format (EQ/UQ/raw).
 * Tries a direct key hit first, then falls back to address-equality comparison.
 */
export function findRate(rates: Record<string, RateEntry>, address: string): RateEntry | undefined {
    const direct = rates[address];
    if (direct) return direct;

    for (const [key, entry] of Object.entries(rates)) {
        if (compareAddress(key, address)) return entry;
    }
    return undefined;
}
