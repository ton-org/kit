/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * Client-side limit enforcement (the contract does not enforce limits).
 *
 * {@link findLimitViolation} is the pure rolling-window check; {@link evaluateLimits}
 * orchestrates the on-chain reads (limits_hash -> cache or re-sync -> spend history)
 * through an injected {@link LimitsEnv} so the IO is testable in isolation.
 */

import type { StoredLimits } from '../registry/config.js';
import { TON_ASSET_KEY, normalizeAssetKey } from './limits-codec.js';
import { sumSpendWithinWindow } from './spend-window.js';
import type { PendingSpend, SpendEntry } from './types.js';

/** The inner-key sentinel that marks a per-transaction (non-rolling) limit. */
const PER_TX_WINDOW = 0;

export interface LimitViolation {
    /** Human-readable asset key from the limits config (`'TON'` or a jetton master). */
    asset: string;
    /** Rolling window in seconds; `0` means a per-transaction limit. */
    windowSeconds: number;
    /** The configured maximum, in base units. */
    limit: bigint;
    /** Spend already observed in the window (`0` for per-transaction limits). */
    alreadySpent: bigint;
    /** The pending transaction's spend for this asset. */
    pending: bigint;
    /** `alreadySpent + pending`. */
    total: bigint;
}

interface IndexedAssetLimit {
    displayKey: string;
    windows: Map<number, bigint>;
}

/**
 * Build a normalized lookup of the limits. Fails closed (throws) on any malformed
 * entry — an unparseable asset key, a non-integer/negative window, or a non-integer
 * amount — so corrupt config refuses sends rather than silently disabling a cap.
 * A well-formed on-chain limitsDict never produces malformed entries.
 */
function indexLimits(limits: StoredLimits): Map<string, IndexedAssetLimit> {
    const byAsset = new Map<string, IndexedAssetLimit>();
    for (const [displayKey, assetLimit] of Object.entries(limits.assets)) {
        const normalizedKey = normalizeAssetKey(displayKey);
        if (normalizedKey === null) {
            throw new Error(`Invalid spend-limit config: asset key "${displayKey}" is not a valid address.`);
        }
        const windows = new Map<number, bigint>();
        for (const [windowSeconds, amount] of Object.entries(assetLimit.windows)) {
            const seconds = Number(windowSeconds);
            if (!Number.isInteger(seconds) || seconds < 0) {
                throw new Error(
                    `Invalid spend-limit config: window "${windowSeconds}" for asset "${displayKey}" is not a non-negative integer.`,
                );
            }
            let max: bigint;
            try {
                max = BigInt(amount);
            } catch {
                throw new Error(
                    `Invalid spend-limit config: amount "${amount}" for asset "${displayKey}" is not an integer.`,
                );
            }
            if (max < 0n) {
                throw new Error(
                    `Invalid spend-limit config: amount "${amount}" for asset "${displayKey}" is negative.`,
                );
            }
            windows.set(seconds, max);
        }
        byAsset.set(normalizedKey, { displayKey, windows });
    }
    return byAsset;
}

/** Normalized-key -> pending amount for every asset this transaction actually spends. */
function affectedAssets(spend: PendingSpend): Map<string, bigint> {
    const affected = new Map<string, bigint>();
    if (spend.ton > 0n) {
        affected.set(TON_ASSET_KEY, spend.ton);
    }
    for (const [master, amount] of spend.jettons) {
        if (amount > 0n) {
            affected.set(master, amount);
        }
    }
    return affected;
}

/** Largest rolling window (seconds > 0) referenced by any asset the tx spends; `0` if none. */
export function maxRelevantWindow(limits: StoredLimits, spend: PendingSpend): number {
    const index = indexLimits(limits);
    let maxWindow = 0;
    for (const normalizedKey of affectedAssets(spend).keys()) {
        const assetLimit = index.get(normalizedKey);
        if (!assetLimit) {
            continue;
        }
        for (const windowSeconds of assetLimit.windows.keys()) {
            if (windowSeconds > maxWindow) {
                maxWindow = windowSeconds;
            }
        }
    }
    return maxWindow;
}

/**
 * Pure rolling-window check. Returns the first limit a transaction would breach,
 * or `null` when every affected asset stays within its configured windows.
 */
export function findLimitViolation(
    limits: StoredLimits,
    spend: PendingSpend,
    spendEntries: SpendEntry[],
    now: number,
): LimitViolation | null {
    const index = indexLimits(limits);

    for (const [normalizedKey, pending] of affectedAssets(spend)) {
        const assetLimit = index.get(normalizedKey);
        if (!assetLimit) {
            continue; // asset has no configured limit
        }
        const windowsAscending = [...assetLimit.windows.entries()].sort((a, b) => a[0] - b[0]);
        for (const [windowSeconds, limit] of windowsAscending) {
            if (windowSeconds === PER_TX_WINDOW) {
                if (pending > limit) {
                    return {
                        asset: assetLimit.displayKey,
                        windowSeconds,
                        limit,
                        alreadySpent: 0n,
                        pending,
                        total: pending,
                    };
                }
                continue;
            }
            const alreadySpent = sumSpendWithinWindow(spendEntries, normalizedKey, now, windowSeconds);
            const total = alreadySpent + pending;
            if (total > limit) {
                return { asset: assetLimit.displayKey, windowSeconds, limit, alreadySpent, pending, total };
            }
        }
    }

    return null;
}

/** Render a violation as a human-readable, broadcast-blocking error message. */
export function formatLimitViolation(violation: LimitViolation): string {
    const assetLabel = violation.asset === TON_ASSET_KEY ? 'TON' : `jetton ${violation.asset}`;
    if (violation.windowSeconds === PER_TX_WINDOW) {
        return (
            `Transaction blocked by spend limit: ${assetLabel} per-transaction limit is ` +
            `${violation.limit} base units, but this transaction sends ${violation.pending}.`
        );
    }
    const window = humanizeWindow(violation.windowSeconds);
    return (
        `Transaction blocked by spend limit: ${assetLabel} rolling ${window} limit is ${violation.limit} ` +
        `base units; already spent ${violation.alreadySpent} in the window, and this transaction would add ` +
        `${violation.pending} (total ${violation.total}).`
    );
}

function humanizeWindow(seconds: number): string {
    const units: Array<[number, string]> = [
        [86400, 'd'],
        [3600, 'h'],
        [60, 'm'],
    ];
    for (const [size, suffix] of units) {
        if (seconds >= size && seconds % size === 0) {
            return `${seconds / size}${suffix} (${seconds}s)`;
        }
    }
    return `${seconds}s`;
}

/** Cached per-wallet limits mirrored from the config record. */
export interface CachedLimits {
    limits?: StoredLimits;
    limits_hash?: string;
}

/** Read-through/write-through port over a single wallet's cached limits. */
export interface LimitsCache {
    read(): CachedLimits;
    write(next: CachedLimits): Promise<void>;
}

/** Result of re-syncing limits from the latest on-chain limits-change transaction. */
export interface SyncedLimits {
    limits: StoredLimits;
    hash: string;
}

/** IO surface the enforcement flow depends on; implemented by the wallet service. */
export interface LimitsEnv {
    /** Current time in unix seconds. */
    now(): number;
    /** The on-chain `limits_hash` attribute, or `undefined` when no limits are set. */
    readOnchainLimitsHash(): Promise<string | undefined>;
    readCache(): CachedLimits;
    writeCache(next: CachedLimits): Promise<void>;
    /** Parse + hash the latest on-chain limits-change tx, or `null` when none is found. */
    syncLimitsFromChain(): Promise<SyncedLimits | null>;
    /**
     * Outgoing spend entries within `[now - maxWindowSeconds, now]`. Receives the
     * same `now` the check uses so the fetch cutoff and the window math agree.
     * Must throw rather than return a truncated history (fail closed).
     */
    fetchSpendEntries(maxWindowSeconds: number, now: number): Promise<SpendEntry[]>;
}

export type LimitsDecision = { allowed: true } | { allowed: false; message: string };

/**
 * Decide whether a pending transaction may broadcast:
 *  1. read the on-chain limits_hash; absent -> allow and clear any stale cache;
 *  2. hash matches cache -> use cached limits, else re-sync and persist;
 *  3. a hash that cannot be verified against an on-chain tx is a hard failure;
 *  4. measure spend over the largest relevant window and apply the per-asset checks.
 */
export async function evaluateLimits(env: LimitsEnv, spend: PendingSpend): Promise<LimitsDecision> {
    const onchainHash = await env.readOnchainLimitsHash();

    if (!onchainHash) {
        const cached = env.readCache();
        if (cached.limits || cached.limits_hash) {
            await env.writeCache({});
        }
        return { allowed: true };
    }

    let limits: StoredLimits;
    const cached = env.readCache();
    if (cached.limits && cached.limits_hash === onchainHash) {
        limits = cached.limits;
    } else {
        const synced = await env.syncLimitsFromChain();
        if (!synced) {
            return {
                allowed: false,
                message:
                    `Wallet has on-chain limits (limits_hash=${onchainHash}) but no limits-change ` +
                    `transaction was found to verify them; refusing to send.`,
            };
        }
        if (synced.hash !== onchainHash) {
            return {
                allowed: false,
                message:
                    `On-chain limits_hash (${onchainHash}) does not match the hash of the latest ` +
                    `limits-change transaction (${synced.hash}); refusing to send.`,
            };
        }
        limits = synced.limits;
        await env.writeCache({ limits, limits_hash: onchainHash });
    }

    // Capture `now` once so the history-fetch cutoff and the window math share a boundary.
    const now = env.now();
    const maxWindow = maxRelevantWindow(limits, spend);
    const spendEntries = maxWindow > 0 ? await env.fetchSpendEntries(maxWindow, now) : [];
    const violation = findLimitViolation(limits, spend, spendEntries, now);
    return violation ? { allowed: false, message: formatLimitViolation(violation) } : { allowed: true };
}
