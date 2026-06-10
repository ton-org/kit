/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * Parsed CAIP-2 chain identifier — `<namespace>:<reference>`.
 *
 * @see https://chainagnostic.org/CAIPs/caip-2
 */
export interface Caip2 {
    namespace: string;
    reference: string;
}

/**
 * CAIP-2 identifiers for networks our crypto-onramp providers care about.
 * Single source of truth — providers reference these by name instead of
 * repeating raw `'eip155:1'` strings in each `supportedChains` config.
 *
 * Key naming follows the `<NETWORK>_<ENV>` convention (e.g. `ETHEREUM_MAINNET`)
 * so the entries leave room for testnet additions later.
 */
export const Caip2ByNetwork = {
    EthereumMainnet: 'eip155:1',
    OptimismMainnet: 'eip155:10',
    BscMainnet: 'eip155:56',
    PolygonMainnet: 'eip155:137',
    BaseMainnet: 'eip155:8453',
    ArbitrumMainnet: 'eip155:42161',
    AvalancheMainnet: 'eip155:43114',
    SolanaMainnet: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
    BitcoinMainnet: 'bip122:000000000019d6689c085ae165831e93',
    TronMainnet: 'tron:mainnet',
} as const;
