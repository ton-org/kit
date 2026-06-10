/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Caip2ByNetwork } from '@ton/appkit';

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
    [Caip2ByNetwork.EthereumMainnet]: {
        name: 'Ethereum',
        logo: 'https://cdn.layerswap.io/layerswap/networks/ethereum_mainnet.png',
    },
    [Caip2ByNetwork.OptimismMainnet]: {
        name: 'Optimism',
        logo: 'https://cdn.layerswap.io/layerswap/networks/optimism_mainnet.png',
    },
    [Caip2ByNetwork.BscMainnet]: {
        name: 'BSC',
        logo: 'https://cdn.layerswap.io/layerswap/networks/bsc_mainnet.png',
    },
    [Caip2ByNetwork.PolygonMainnet]: {
        name: 'Polygon',
        logo: 'https://cdn.layerswap.io/layerswap/networks/polygon_mainnet.png',
    },
    [Caip2ByNetwork.BaseMainnet]: {
        name: 'Base',
        logo: 'https://cdn.layerswap.io/layerswap/networks/base_mainnet.png',
    },
    [Caip2ByNetwork.ArbitrumMainnet]: {
        name: 'Arbitrum One',
        logo: 'https://cdn.layerswap.io/layerswap/networks/arbitrum_mainnet.png',
    },
    [Caip2ByNetwork.AvalancheMainnet]: {
        name: 'Avalanche',
        logo: 'https://cdn.layerswap.io/layerswap/networks/avax_mainnet.png',
    },
    [Caip2ByNetwork.SolanaMainnet]: {
        name: 'Solana',
        logo: 'https://cdn.layerswap.io/layerswap/networks/solana_mainnet.png',
    },
    [Caip2ByNetwork.BitcoinMainnet]: {
        name: 'Bitcoin',
        logo: 'https://cdn.layerswap.io/layerswap/networks/bitcoin_mainnet.png',
    },
    [Caip2ByNetwork.TronMainnet]: {
        name: 'Tron',
        logo: 'https://cdn.layerswap.io/layerswap/networks/tron_mainnet.png',
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
