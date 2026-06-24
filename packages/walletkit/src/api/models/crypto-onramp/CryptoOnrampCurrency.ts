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
    /** Token contract address on the source chain, or `'native'` for the chain's native gas coin. */
    address: 'native' | string;
    /** Token symbol, e.g. `'USDT0'`, `'ETH'`. */
    symbol: string;
    /** Full token name, e.g. `'Tether USD0'`. Optional. */
    name?: string;
    /**
     * Decimals used to convert between display and base units.
     * @format int
     * */
    decimals: number;
    /** Logo URL. */
    logo?: string;
}

/**
 * A destination currency the user receives on TON. Chain is implicit (always TON).
 */
export interface CryptoOnrampDestinationCurrency {
    /** Jetton master address (e.g. `'EQCx...'`), or `'ton'` for native Toncoin. */
    address: 'ton' | string;
    /** Token symbol, e.g. `'TON'`, `'USDT'`. */
    symbol: string;
    /** Full token name. */
    name?: string;
    /**
     * Decimals
     * @format int
     * */
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
