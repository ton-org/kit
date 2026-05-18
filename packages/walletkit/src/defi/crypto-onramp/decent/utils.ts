/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { CryptoOnrampStatus } from '../../../api/models';
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
