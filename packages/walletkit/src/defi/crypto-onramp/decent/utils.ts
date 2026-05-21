/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { CryptoOnrampStatus, CryptoOnrampSupportedCurrencies } from '../../../api/models';
import { Caip2ByNetwork } from '../caip2';
import { CryptoOnrampErrorCode } from '../errors';
import type { DecentErrorResponse } from './types';

const EVM_ADDRESS_REGEX = /^(0x)?[0-9a-fA-F]{40}$/;

/**
 * Per-source-chain configuration for Decent. Currently just the Decent chain id;
 * a future address-format regex will live alongside it once non-EVM source chains
 * are supported (see `vmId === 'evm'` guard in `DecentCryptoOnrampProvider`).
 */
export interface DecentChainConfig {
    /** Decent chain identifier — numeric chain id for EVM. */
    slug: string;
}

/**
 * Default mapping of CAIP-2 source chains to Decent network configs.
 * Used by `DecentCryptoOnrampProvider` when no override is passed via config.
 * Exported so consumers can spread/extend it rather than redefining from scratch.
 */
export const DEFAULT_DECENT_SUPPORTED_CHAINS: Record<string, DecentChainConfig> = {
    [Caip2ByNetwork.EthereumMainnet]: { slug: '1' },
    [Caip2ByNetwork.OptimismMainnet]: { slug: '10' },
    [Caip2ByNetwork.BscMainnet]: { slug: '56' },
    [Caip2ByNetwork.PolygonMainnet]: { slug: '137' },
    [Caip2ByNetwork.BaseMainnet]: { slug: '8453' },
    [Caip2ByNetwork.ArbitrumMainnet]: { slug: '42161' },
    [Caip2ByNetwork.AvalancheMainnet]: { slug: '43114' },
};

const LS = 'https://cdn.layerswap.io/layerswap/currencies';

/**
 * Statically-curated supported-currencies list for Decent. Decent's API has no token
 * enumeration endpoint, so we ship a hand-picked list of the most common (chain, token)
 * pairs the provider routes into TON. Consumers can override via
 * `DecentProviderConfig.supportedCurrencies`.
 */
export const DEFAULT_DECENT_SUPPORTED_CURRENCIES: CryptoOnrampSupportedCurrencies = {
    source: [
        // Ethereum
        {
            chain: Caip2ByNetwork.EthereumMainnet,
            address: '0x0000000000000000000000000000000000000000',
            symbol: 'ETH',
            name: 'Ethereum',
            decimals: 18,
            logo: `${LS}/eth.png`,
        },
        {
            chain: Caip2ByNetwork.EthereumMainnet,
            address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
            symbol: 'USDT',
            name: 'Tether',
            decimals: 6,
            logo: `${LS}/usdt.png`,
        },
        {
            chain: Caip2ByNetwork.EthereumMainnet,
            address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            symbol: 'USDC',
            name: 'USD Coin',
            decimals: 6,
            logo: `${LS}/usdc.png`,
        },
        // Optimism
        {
            chain: Caip2ByNetwork.OptimismMainnet,
            address: '0x0000000000000000000000000000000000000000',
            symbol: 'ETH',
            name: 'Ethereum',
            decimals: 18,
            logo: `${LS}/eth.png`,
        },
        {
            chain: Caip2ByNetwork.OptimismMainnet,
            address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
            symbol: 'USDT',
            name: 'Tether',
            decimals: 6,
            logo: `${LS}/usdt.png`,
        },
        {
            chain: Caip2ByNetwork.OptimismMainnet,
            address: '0x0b2c639c533813f4aa9d7837caf62653d097ff85',
            symbol: 'USDC',
            name: 'USD Coin',
            decimals: 6,
            logo: `${LS}/usdc.png`,
        },
        // BSC
        {
            chain: Caip2ByNetwork.BscMainnet,
            address: '0x0000000000000000000000000000000000000000',
            symbol: 'BNB',
            name: 'BNB',
            decimals: 18,
            logo: `${LS}/bnb.png`,
        },
        {
            chain: Caip2ByNetwork.BscMainnet,
            address: '0x55d398326f99059fF775485246999027B3197955',
            symbol: 'USDT',
            name: 'Tether',
            decimals: 18,
            logo: `${LS}/usdt.png`,
        },
        {
            chain: Caip2ByNetwork.BscMainnet,
            address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
            symbol: 'USDC',
            name: 'USD Coin',
            decimals: 18,
            logo: `${LS}/usdc.png`,
        },
        // Polygon
        {
            chain: Caip2ByNetwork.PolygonMainnet,
            address: '0x0000000000000000000000000000000000000000',
            symbol: 'POL',
            name: 'Polygon',
            decimals: 18,
            logo: `${LS}/pol.png`,
        },
        {
            chain: Caip2ByNetwork.PolygonMainnet,
            address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
            symbol: 'USDT',
            name: 'Tether',
            decimals: 6,
            logo: `${LS}/usdt.png`,
        },
        {
            chain: Caip2ByNetwork.PolygonMainnet,
            address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
            symbol: 'USDC',
            name: 'USD Coin',
            decimals: 6,
            logo: `${LS}/usdc.png`,
        },
        // Base
        {
            chain: Caip2ByNetwork.BaseMainnet,
            address: '0x0000000000000000000000000000000000000000',
            symbol: 'ETH',
            name: 'Ethereum',
            decimals: 18,
            logo: `${LS}/eth.png`,
        },
        {
            chain: Caip2ByNetwork.BaseMainnet,
            address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            symbol: 'USDC',
            name: 'USD Coin',
            decimals: 6,
            logo: `${LS}/usdc.png`,
        },
        // Arbitrum
        {
            chain: Caip2ByNetwork.ArbitrumMainnet,
            address: '0x0000000000000000000000000000000000000000',
            symbol: 'ETH',
            name: 'Ethereum',
            decimals: 18,
            logo: `${LS}/eth.png`,
        },
        {
            chain: Caip2ByNetwork.ArbitrumMainnet,
            address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
            symbol: 'USDT0',
            name: 'Tether USD0',
            decimals: 6,
            logo: `${LS}/usdt0.png`,
        },
        {
            chain: Caip2ByNetwork.ArbitrumMainnet,
            address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
            symbol: 'USDC',
            name: 'USD Coin',
            decimals: 6,
            logo: `${LS}/usdc.png`,
        },
        // Avalanche
        {
            chain: Caip2ByNetwork.AvalancheMainnet,
            address: '0x0000000000000000000000000000000000000000',
            symbol: 'AVAX',
            name: 'Avalanche',
            decimals: 18,
            logo: `${LS}/avax.png`,
        },
        {
            chain: Caip2ByNetwork.AvalancheMainnet,
            address: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
            symbol: 'USDT',
            name: 'Tether',
            decimals: 6,
            logo: `${LS}/usdt.png`,
        },
        {
            chain: Caip2ByNetwork.AvalancheMainnet,
            address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
            symbol: 'USDC',
            name: 'USD Coin',
            decimals: 6,
            logo: `${LS}/usdc.png`,
        },
    ],
    destination: [
        {
            address: '0x0000000000000000000000000000000000000000',
            symbol: 'TON',
            name: 'Toncoin',
            decimals: 9,
            logo: 'https://cdn.layerswap.io/layerswap/networks/ton_mainnet.png',
        },
        {
            address: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
            symbol: 'USDT',
            name: 'Tether',
            decimals: 6,
            logo: `${LS}/usdt.png`,
        },
    ],
};

/**
 * Translate a Decent-specific API error code into a provider-agnostic CryptoOnrampError code.
 * Falls back to the original code when there is no known mapping.
 */
export const mapDecentErrorCode = (
    apiCode: string | undefined,
    fallback: CryptoOnrampErrorCode,
): CryptoOnrampErrorCode => {
    switch (apiCode) {
        case 'AMOUNT_TOO_HIGH':
            return CryptoOnrampErrorCode.AmountTooLarge;
        case 'AMOUNT_TOO_LOW':
            return CryptoOnrampErrorCode.AmountTooSmall;
        case 'INVALID_SOURCE_TOKEN':
            return CryptoOnrampErrorCode.UnsupportedSourceToken;
        case 'INVALID_DESTINATION_TOKEN':
            return CryptoOnrampErrorCode.UnsupportedDestinationToken;
        default:
            return fallback;
    }
};

export const isErrorResponse = (body: unknown): body is DecentErrorResponse => {
    return (
        typeof body === 'object' &&
        body !== null &&
        (body as { success?: unknown }).success === false &&
        typeof (body as { error?: unknown }).error === 'object'
    );
};

export const mapStatus = (status: string): CryptoOnrampStatus => {
    switch (status) {
        case 'success':
            return 'success';
        case 'pending':
            return 'pending';
        case 'failed':
        case 'requires refund':
        case 'refunded':
            return 'failed';
        default:
            return 'pending';
    }
};

export const isEvmAddress = (address: string): boolean => {
    return EVM_ADDRESS_REGEX.test(address);
};
