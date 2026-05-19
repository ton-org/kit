/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { CryptoOnrampStatus, CryptoOnrampSupportedCurrencies } from '../../../api/models';
import type { DecentErrorResponse } from './types';

const EVM_ADDRESS_REGEX = /^(0x)?[0-9a-fA-F]{40}$/;

/**
 * Default mapping of CAIP-2 source chains to Decent chain identifiers
 * (numeric chain id for EVM, opaque numeric strings for non-EVM VMs).
 * Used by `DecentCryptoOnrampProvider` when no override is passed via config.
 * Exported so consumers can spread/extend it rather than redefining from scratch.
 */
export const DEFAULT_DECENT_SUPPORTED_CHAINS: Record<string, string> = {
    'eip155:1': '1', // Ethereum
    'eip155:10': '10', // Optimism
    'eip155:56': '56', // BSC
    'eip155:137': '137', // Polygon
    'eip155:8453': '8453', // Base
    'eip155:42161': '42161', // Arbitrum One
    'eip155:43114': '43114', // Avalanche
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
            chain: 'eip155:1',
            address: '0x0000000000000000000000000000000000000000',
            symbol: 'ETH',
            name: 'Ethereum',
            decimals: 18,
            logo: `${LS}/eth.png`,
        },
        {
            chain: 'eip155:1',
            address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
            symbol: 'USDT',
            name: 'Tether',
            decimals: 6,
            logo: `${LS}/usdt.png`,
        },
        {
            chain: 'eip155:1',
            address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            symbol: 'USDC',
            name: 'USD Coin',
            decimals: 6,
            logo: `${LS}/usdc.png`,
        },
        // Optimism
        {
            chain: 'eip155:10',
            address: '0x0000000000000000000000000000000000000000',
            symbol: 'ETH',
            name: 'Ethereum',
            decimals: 18,
            logo: `${LS}/eth.png`,
        },
        {
            chain: 'eip155:10',
            address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
            symbol: 'USDT',
            name: 'Tether',
            decimals: 6,
            logo: `${LS}/usdt.png`,
        },
        {
            chain: 'eip155:10',
            address: '0x0b2c639c533813f4aa9d7837caf62653d097ff85',
            symbol: 'USDC',
            name: 'USD Coin',
            decimals: 6,
            logo: `${LS}/usdc.png`,
        },
        // BSC
        {
            chain: 'eip155:56',
            address: '0x0000000000000000000000000000000000000000',
            symbol: 'BNB',
            name: 'BNB',
            decimals: 18,
            logo: `${LS}/bnb.png`,
        },
        {
            chain: 'eip155:56',
            address: '0x55d398326f99059fF775485246999027B3197955',
            symbol: 'USDT',
            name: 'Tether',
            decimals: 18,
            logo: `${LS}/usdt.png`,
        },
        {
            chain: 'eip155:56',
            address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
            symbol: 'USDC',
            name: 'USD Coin',
            decimals: 18,
            logo: `${LS}/usdc.png`,
        },
        // Polygon
        {
            chain: 'eip155:137',
            address: '0x0000000000000000000000000000000000000000',
            symbol: 'POL',
            name: 'Polygon',
            decimals: 18,
            logo: `${LS}/pol.png`,
        },
        {
            chain: 'eip155:137',
            address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
            symbol: 'USDT',
            name: 'Tether',
            decimals: 6,
            logo: `${LS}/usdt.png`,
        },
        {
            chain: 'eip155:137',
            address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
            symbol: 'USDC',
            name: 'USD Coin',
            decimals: 6,
            logo: `${LS}/usdc.png`,
        },
        // Base
        {
            chain: 'eip155:8453',
            address: '0x0000000000000000000000000000000000000000',
            symbol: 'ETH',
            name: 'Ethereum',
            decimals: 18,
            logo: `${LS}/eth.png`,
        },
        {
            chain: 'eip155:8453',
            address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            symbol: 'USDC',
            name: 'USD Coin',
            decimals: 6,
            logo: `${LS}/usdc.png`,
        },
        // Arbitrum
        {
            chain: 'eip155:42161',
            address: '0x0000000000000000000000000000000000000000',
            symbol: 'ETH',
            name: 'Ethereum',
            decimals: 18,
            logo: `${LS}/eth.png`,
        },
        {
            chain: 'eip155:42161',
            address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
            symbol: 'USDT0',
            name: 'Tether USD0',
            decimals: 6,
            logo: `${LS}/usdt0.png`,
        },
        {
            chain: 'eip155:42161',
            address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
            symbol: 'USDC',
            name: 'USD Coin',
            decimals: 6,
            logo: `${LS}/usdc.png`,
        },
        // Avalanche
        {
            chain: 'eip155:43114',
            address: '0x0000000000000000000000000000000000000000',
            symbol: 'AVAX',
            name: 'Avalanche',
            decimals: 18,
            logo: `${LS}/avax.png`,
        },
        {
            chain: 'eip155:43114',
            address: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
            symbol: 'USDT',
            name: 'Tether',
            decimals: 6,
            logo: `${LS}/usdt.png`,
        },
        {
            chain: 'eip155:43114',
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
            logo: 'https://pretty-picture-g2.s3.eu-central-1.amazonaws.com/ton_ebae1444e3.svg',
        },
        {
            address: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
            symbol: 'USDT',
            name: 'Tether',
            decimals: 6,
            logo: 'https://pretty-picture-g2.s3.eu-central-1.amazonaws.com/usdt20_9a8c677b99_c67aed2f04.svg',
        },
    ],
};

/**
 * Build the CAIP-2 representation for an EVM chain id.
 */
export const evmChainIdToCaip2 = (chainId: number | string): string => `eip155:${chainId}`;

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
