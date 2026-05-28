/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { TonApiGaslessChainConfig } from './TonApiGaslessChainConfig';

/**
 * Configuration for `TonApiGaslessProvider`.
 *
 * One provider instance handles every configured chain. When `chains` is omitted,
 * `createFromContext` auto-registers every network the kit was configured with.
 *
 * @example
 * ```ts
 * createTonApiGaslessProvider({
 *     chains: {
 *         [Network.mainnet().chainId]: { apiKey: process.env.TON_API_KEY_MAINNET },
 *         [Network.testnet().chainId]: { apiKey: process.env.TON_API_KEY_TESTNET },
 *     },
 * });
 * ```
 */
export interface TonApiGaslessProviderConfig {
    /** Per-chain settings keyed by `Network#chainId`. */
    chains?: { [chainId: number]: TonApiGaslessChainConfig };
    /** Provider id. Defaults to `tonapi`. */
    providerId?: string;
    /** Number of send retries on transient errors. Defaults to 5. */
    sendRetries?: number;
    /** Delay between send retries in ms. Defaults to 2000. */
    sendRetryDelayMs?: number;
    /**
     * TTL for the in-memory `/v2/gasless/config` cache (ms). Defaults to
     * 5 minutes. Set to `0` to disable caching.
     */
    configCacheTtlMs?: number;
}
