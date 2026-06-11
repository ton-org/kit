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

/**
 * Formats TON amount for consistent display (4 decimals).
 * Accepts amount in nanoton (string) or formatted value like "0.001 TON".
 * TODO - make better function for formatting amounts
 */
export const formatTonForDisplay = (amountOrValue: string): string => {
    const num =
        amountOrValue.includes('TON') || amountOrValue.includes('.')
            ? parseFloat(
                  String(amountOrValue)
                      .replace(/\s*TON\s*$/i, '')
                      .trim(),
              ) || 0
            : parseFloat(amountOrValue || '0') / 1e9;
    return num.toFixed(4);
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
