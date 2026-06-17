/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { Network } from '@ton/appkit';

export interface AppkitUIToken {
    /** Unique identifier for the token, used for section grouping */
    id: string;
    /** Token symbol, e.g. "GRAM" */
    symbol: string;
    /** Full token name, e.g. "Gram" */
    name: string;
    /** Number of decimals for the token */
    decimals: number;
    /** Jetton contract address (use "ton" for GRAM) */
    address: string;
    /** Optional token logo */
    logo?: string;
    /** Optional exchange rate: 1 token = rate fiat units (used for fiat value display) */
    rate?: string;
    /** Network the token belongs to. */
    network: Network;
}
