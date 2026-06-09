/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * A source currency the user can spend to onramp into a TON asset. Always
 * lives on a non-TON chain (identified by CAIP-2).
 */
export interface CryptoOnrampSourceCurrency {
    /** CAIP-2 source chain identifier, e.g. `'eip155:42161'`. */
    chain: string;
    /** Token contract address on the source chain, or zero address for the native gas token. */
    address: string;
    /** Token symbol, e.g. `'USDT0'`, `'ETH'`. */
    symbol: string;
    /** Full token name, e.g. `'Tether USD0'`. Optional. */
    name?: string;
    /** Decimals used to convert between display and base units. */
    decimals: number;
    /** Logo URL. */
    logo?: string;
}

/**
 * A destination currency the user receives on TON. Chain is implicit (always TON).
 */
export interface CryptoOnrampDestinationCurrency {
    /** Address as the provider expects it (raw form, e.g. `'EQCx...'` for jettons,
     * `'0x000...'` for native TON). */
    address: string;
    /** Token symbol, e.g. `'TON'`, `'USDT'`. */
    symbol: string;
    /** Full token name. */
    name?: string;
    /** Decimals. */
    decimals: number;
    /** Logo URL. */
    logo?: string;
}

/**
 * Combined currency listing returned by `CryptoOnrampProvider.getSupportedCurrencies()`.
 */
export interface CryptoOnrampSupportedCurrencies {
    source: CryptoOnrampSourceCurrency[];
    destination: CryptoOnrampDestinationCurrency[];
}
