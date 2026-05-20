/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { CryptoOnrampStatus, CryptoOnrampSupportedCurrencies } from '../../../api/models';
import { CryptoOnrampError } from '../errors';
import type { LayerswapErrorResponse, LayerswapSwapStatus } from './types';

const EVM_ADDRESS_REGEX = /^(0x)?[0-9a-fA-F]{40}$/;

export const LAYERSWAP_DESTINATION_NETWORK = 'TON_MAINNET';

/**
 * Default mapping of CAIP-2 source chains to Layerswap network slugs.
 * Used by `LayerswapCryptoOnrampProvider` when no override is passed via config.
 * Exported so consumers can spread/extend it rather than redefining from scratch.
 */
export const DEFAULT_LAYERSWAP_SUPPORTED_CHAINS: Record<string, string> = {
    'eip155:1': 'ETHEREUM_MAINNET', // Ethereum
    'eip155:10': 'OPTIMISM_MAINNET', // Optimism
    'eip155:56': 'BSC_MAINNET', // BSC
    'eip155:137': 'POLYGON_MAINNET', // Polygon
    'eip155:8453': 'BASE_MAINNET', // Base
    'eip155:42161': 'ARBITRUM_MAINNET', // Arbitrum One
    'eip155:43114': 'AVALANCHE_MAINNET', // Avalanche
    'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp': 'SOLANA_MAINNET', // Solana
    'bip122:000000000019d6689c085ae165831e93': 'BITCOIN_MAINNET', // Bitcoin
};

/**
 * Default supported-currencies list returned by {@link LayerswapCryptoOnrampProvider.getDefaultSupportedCurrencies}.
 * Used as `placeholderData` by the appkit-react hook while live discovery resolves.
 */
export const DEFAULT_LAYERSWAP_SUPPORTED_CURRENCIES: CryptoOnrampSupportedCurrencies = {
    source: [
        {
            chain: 'eip155:42161',
            address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
            symbol: 'USDT0',
            name: 'Tether USD0',
            decimals: 6,
            logo: 'https://cdn.layerswap.io/layerswap/currencies/usdt0.png',
        },
    ],
    destination: [
        {
            address: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
            symbol: 'USDT',
            name: 'Tether',
            decimals: 6,
            logo: 'https://cdn.layerswap.io/layerswap/currencies/usdt.png',
        },
    ],
};

export const isEvmAddress = (address: string): boolean => {
    return EVM_ADDRESS_REGEX.test(address);
};

export const isErrorResponse = (body: unknown): body is LayerswapErrorResponse => {
    return (
        typeof body === 'object' &&
        body !== null &&
        typeof (body as { error?: unknown }).error === 'object' &&
        (body as { error: { message?: unknown } }).error !== null
    );
};

/**
 * Translate a Layerswap-specific API error code into a provider-agnostic CryptoOnrampError code.
 * Falls back to the original code when there is no known mapping.
 */
export const mapLayerswapErrorCode = (apiCode: string | undefined, fallback: string): string => {
    switch (apiCode) {
        case 'ROUTE_NOT_FOUND_ERROR':
            return CryptoOnrampError.ROUTE_NOT_FOUND;
        default:
            return apiCode ?? fallback;
    }
};

export const mapStatus = (status: LayerswapSwapStatus | string): CryptoOnrampStatus => {
    switch (status) {
        case 'completed':
        case 'user_payout_completed':
        case 'payout_completed':
            return 'success';
        case 'user_transfer_pending':
        case 'user_transfer_delayed':
        case 'ls_transfer_pending':
        case 'initiated':
        case 'created':
            return 'pending';
        case 'expired':
        case 'failed':
        case 'cancelled':
        case 'refunded':
        case 'requires_refund':
            return 'failed';
        default:
            return 'pending';
    }
};

/**
 * Format a base-units integer string into a decimal token-units string.
 * e.g. formatBaseUnits('2000000', 6) === '2'
 */
export const formatBaseUnits = (base: string, decimals: number): string => {
    if (!/^\d+$/.test(base)) {
        throw new Error(`formatBaseUnits: not a non-negative integer string: "${base}"`);
    }
    if (decimals === 0) return base;
    const padded = base.padStart(decimals + 1, '0');
    const whole = padded.slice(0, padded.length - decimals);
    const frac = padded.slice(padded.length - decimals).replace(/0+$/, '');
    return frac.length > 0 ? `${whole}.${frac}` : whole;
};

/**
 * Scale a decimal token-units string by 10^decimals and return the integer
 * base-units string, truncating any excess fractional digits.
 */
export const parseBaseUnits = (value: number | string, decimals: number): string => {
    const str = typeof value === 'number' ? value.toString() : value;
    if (!/^\d+(\.\d+)?$/.test(str)) {
        throw new Error(`parseBaseUnits: not a non-negative decimal: "${str}"`);
    }
    const [whole, frac = ''] = str.split('.');
    const truncated = frac.slice(0, decimals).padEnd(decimals, '0');
    const combined = `${whole}${truncated}`.replace(/^0+/, '');
    return combined.length > 0 ? combined : '0';
};
