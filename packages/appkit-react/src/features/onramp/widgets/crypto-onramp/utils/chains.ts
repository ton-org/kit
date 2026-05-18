/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * Display info for a CAIP-2 chain — used by the crypto onramp widget to
 * render chain names and logos.
 */
export interface ChainInfo {
    name: string;
    logo?: string;
}

/**
 * Default mapping of CAIP-2 chain identifiers to display info used in the
 * crypto onramp widget. Consumers can override or extend this map via the
 * `chains` prop on `CryptoOnrampWidgetProvider`.
 *
 * @see https://chainagnostic.org/CAIPs/caip-2
 */
export const DEFAULT_CHAINS: Record<string, ChainInfo> = {
    'eip155:1': {
        name: 'Ethereum',
        logo: 'https://cdn.layerswap.io/layerswap/networks/ethereum_mainnet.png',
    },
    'eip155:10': {
        name: 'Optimism',
        logo: 'https://cdn.layerswap.io/layerswap/networks/optimism_mainnet.png',
    },
    'eip155:56': {
        name: 'BSC',
        logo: 'https://cdn.layerswap.io/layerswap/networks/bsc_mainnet.png',
    },
    'eip155:137': {
        name: 'Polygon',
        logo: 'https://cdn.layerswap.io/layerswap/networks/polygon_mainnet.png',
    },
    'eip155:8453': {
        name: 'Base',
        logo: 'https://cdn.layerswap.io/layerswap/networks/base_mainnet.png',
    },
    'eip155:42161': {
        name: 'Arbitrum One',
        logo: 'https://cdn.layerswap.io/layerswap/networks/arbitrum_mainnet.png',
    },
    'eip155:43114': {
        name: 'Avalanche',
        logo: 'https://cdn.layerswap.io/layerswap/networks/avax_mainnet.png',
    },
    'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp': {
        name: 'Solana',
        logo: 'https://cdn.layerswap.io/layerswap/networks/solana_mainnet.png',
    },
    'bip122:000000000019d6689c085ae165831e93': {
        name: 'Bitcoin',
        logo: 'https://cdn.layerswap.io/layerswap/networks/bitcoin_mainnet.png',
    },
};

/**
 * Resolve display info for a CAIP-2 chain. Falls back to a synthetic info
 * object whose `name` is the reference portion of the CAIP-2 string
 * (e.g. `eip155:9999` → `9999`), or the raw value if it does not look like
 * a CAIP-2 identifier.
 */
export const getChainInfo = (chain: string, chains: Record<string, ChainInfo>): ChainInfo => {
    const direct = chains[chain];
    if (direct) return direct;
    const colonIdx = chain.indexOf(':');
    return { name: colonIdx >= 0 ? chain.slice(colonIdx + 1) : chain };
};
