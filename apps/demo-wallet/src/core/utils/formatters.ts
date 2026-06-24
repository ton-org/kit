/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Address } from '@ton/core';
import { Base64ToHex } from '@ton/walletkit';

export function normalizeAddress(address: string, bounceable = false): string | null {
    try {
        return Address.parse(address).toString({ bounceable });
    } catch {
        return null;
    }
}

export function shortenAddress(addr?: string, count = 4, bounceable = false): string {
    if (!addr) return '';
    const normalized = normalizeAddress(addr, bounceable) ?? addr;
    return normalized.length <= count * 2 ? normalized : `${normalized.slice(0, count)}...${normalized.slice(-count)}`;
}

/**
 * Compare two TON addresses for equality (handles different formats: 0:xxx, EQxxx, UQxxx)
 */
export function sameAddress(a: string, b: string): boolean {
    if (!a || !b) return a === b;
    try {
        return Address.parse(a).equals(Address.parse(b));
    } catch {
        return a === b;
    }
}

/**
 * Formats a Unix timestamp (in seconds) to a localized date/time string
 * @param timestampSeconds - Unix timestamp in seconds
 * @returns Formatted date/time string
 */
export const formatTimestamp = (timestampSeconds: number): string => {
    return new Date(timestampSeconds * 1000).toLocaleString();
};

type ExplorerNetwork = 'mainnet' | 'testnet' | 'tetra';

function getTonviewerHost(network: ExplorerNetwork): string {
    if (network === 'testnet') return 'testnet.tonviewer.com';
    if (network === 'tetra') return 'tetra.tonviewer.com';
    return 'tonviewer.com';
}

function toHexHash(hash: string): string {
    if (/^(0x)?[0-9a-fA-F]+$/.test(hash)) {
        return hash.startsWith('0x') ? hash.slice(2) : hash;
    }
    try {
        const hex = Base64ToHex(hash);
        return hex.startsWith('0x') ? hex.slice(2) : hex;
    } catch {
        return hash;
    }
}

export function getTonviewerTxUrl(network: ExplorerNetwork, hash: string): string {
    return `https://${getTonviewerHost(network)}/transaction/${toHexHash(hash)}`;
}

/**
 * Formats a human-readable amount for compact display, mirroring the appkit-react
 * widget formatter (`formatLargeValue` from `@ton/appkit`): abbreviates large values
 * (M/B/T) and otherwise truncates to `decimals` fractional digits with locale
 * thousands separators. Expects a decimal amount, not nanoton.
 */
export const formatLargeValue = (amount: string, decimals: number = 2, minimumFractionDigits: number = 0): string => {
    const cleanAmount = amount.toString().replace(/\s/g, '');
    const intPart = cleanAmount.split('.')[0] || '0';

    // 13+ integer digits (>= 1e12) => trillions, e.g. "1.23T"
    if (intPart.length > 12) {
        return `${(Number(intPart.slice(0, -10)) / 100).toLocaleString('en-US')}T`;
    }
    // 10+ integer digits (>= 1e9) => billions, e.g. "1.23B"
    if (intPart.length > 9) {
        return `${(Number(intPart.slice(0, -7)) / 100).toLocaleString('en-US')}B`;
    }
    // 7+ integer digits (>= 1e6) => millions, e.g. "1.23M"
    if (intPart.length > 6) {
        return `${(Number(intPart.slice(0, -4)) / 100).toLocaleString('en-US')}M`;
    }

    const value = parseFloat(cleanAmount);
    if (isNaN(value)) {
        return '0';
    }

    const factor = Math.pow(10, decimals);
    const truncated = Math.floor(value * factor) / factor;

    return truncated.toLocaleString('en-US', { minimumFractionDigits, maximumFractionDigits: decimals });
};
