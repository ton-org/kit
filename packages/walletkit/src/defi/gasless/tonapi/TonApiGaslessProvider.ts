/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Address } from '@ton/core';
import { LRUCache } from 'lru-cache';

import type {
    GaslessConfig,
    GaslessProviderMetadata,
    GaslessQuote,
    GaslessQuoteParams,
    GaslessSendParams,
    GaslessSendResponse,
    Network,
} from '../../../api/models';
import { ApiClientTonApi } from '../../../clients/tonapi/ApiClientTonApi';
import { globalLogger } from '../../../core/Logger';
import type { ProviderFactoryContext } from '../../../types/factory';
import { CallForSuccess } from '../../../utils/retry';
import { GaslessError, GaslessErrorCode } from '../errors';
import { GaslessProvider } from '../GaslessProvider';
import {
    DEFAULT_CONFIG_CACHE_TTL_MS,
    DEFAULT_METADATA,
    DEFAULT_PROVIDER_ID,
    DEFAULT_QUOTE_RETRIES,
    DEFAULT_QUOTE_RETRY_DELAY_MS,
    DEFAULT_SEND_RETRIES,
    DEFAULT_SEND_RETRY_DELAY_MS,
} from './constants';
import { isTransientError, networkFromChainId } from './utils';
import { mapGaslessConfig } from './mappers/map-gasless-config';
import { mapTonApiGaslessError } from './mappers/map-gasless-error';
import { buildGaslessQuoteRequest, mapGaslessQuote } from './mappers/map-gasless-quote';
import { buildGaslessSendRequest, mapGaslessSend } from './mappers/map-gasless-send';
import type { TonApiGaslessChainConfig, TonApiGaslessProviderConfig } from './models';
import type { TonApiGaslessConfig } from './types/config';
import type { TonApiGaslessEstimateResponse } from './types/estimate';
import type { TonApiGaslessSendResponse } from './types/send';
import { DefiErrorCode, DefiError } from '../../errors';

const log = globalLogger.createChild('TonApiGaslessProvider');

/**
 * Gasless provider implementation backed by the public TonAPI REST API.
 *
 * Implements the flow documented at https://docs.tonapi.io/tonapi/rest-api/gasless.
 *
 * @example
 * ```typescript
 * import { Network } from '@ton/walletkit';
 * import { createTonApiGaslessProvider } from '@ton/walletkit/gasless/tonapi';
 *
 * const provider = createTonApiGaslessProvider({
 *     chains: {
 *         [Network.mainnet().chainId]: { apiKey: process.env.TON_API_KEY },
 *     },
 * });
 *
 * kit.gasless.registerProvider(provider);
 * ```
 */
export class TonApiGaslessProvider extends GaslessProvider {
    readonly providerId: string;

    private readonly chainConfig: Record<string, TonApiGaslessChainConfig>;
    private readonly clients: Record<string, ApiClientTonApi> = {};
    private readonly sendRetries: number;
    private readonly sendRetryDelayMs: number;
    private readonly quoteRetries: number;
    private readonly quoteRetryDelayMs: number;
    private readonly configCacheTtlMs: number;
    private readonly configCache?: LRUCache<string, GaslessConfig, Network>;

    /**
     * @internal Use {@link createTonApiGaslessProvider} (AppKit) or {@link TonApiGaslessProvider.createFromContext}.
     */
    private constructor(chainConfig: Record<string, TonApiGaslessChainConfig>, options: TonApiGaslessProviderConfig) {
        super();
        this.chainConfig = chainConfig;
        this.providerId = options.providerId ?? DEFAULT_PROVIDER_ID;
        this.sendRetries = options.sendRetries ?? DEFAULT_SEND_RETRIES;
        this.sendRetryDelayMs = options.sendRetryDelayMs ?? DEFAULT_SEND_RETRY_DELAY_MS;
        this.quoteRetries = options.quoteRetries ?? DEFAULT_QUOTE_RETRIES;
        this.quoteRetryDelayMs = options.quoteRetryDelayMs ?? DEFAULT_QUOTE_RETRY_DELAY_MS;
        this.configCacheTtlMs = options.configCacheTtlMs ?? DEFAULT_CONFIG_CACHE_TTL_MS;

        if (this.configCacheTtlMs > 0) {
            // LRUCache's `fetchMethod` joins concurrent calls into one fetch and
            // drops the entry on rejection — exactly the dedup+no-cache-failures
            // semantics we want. Network is threaded via `context` per call.
            this.configCache = new LRUCache<string, GaslessConfig, Network>({
                max: Math.max(1, Object.keys(chainConfig).length),
                ttl: this.configCacheTtlMs,
                fetchMethod: (_chainId, _stale, { context }) => this.fetchConfig(context),
            });
        }

        log.info('TonApiGaslessProvider initialized', {
            providerId: this.providerId,
            chains: Object.keys(this.chainConfig),
        });
    }

    /**
     * Build a provider that serves every network the kit was configured with.
     *
     * If `config.chains` is provided, only those chains are registered (and they
     * must intersect with the kit's configured networks). Otherwise every
     * configured network gets a default TonAPI client.
     */
    static createFromContext(
        ctx: ProviderFactoryContext,
        config: TonApiGaslessProviderConfig = {},
    ): TonApiGaslessProvider {
        const configuredChains = new Set(ctx.networkManager.getConfiguredNetworks().map((n) => n.chainId));
        const chainConfig: Record<string, TonApiGaslessChainConfig> = {};

        if (config.chains) {
            for (const [chainId, perChain] of Object.entries(config.chains)) {
                if (!configuredChains.has(chainId)) {
                    log.warn('Skipping TonApi gasless chain not configured in the kit', { chainId });
                    continue;
                }
                chainConfig[chainId] = perChain;
            }
        } else {
            for (const chainId of configuredChains) {
                chainConfig[chainId] = {};
            }
        }

        if (Object.keys(chainConfig).length === 0) {
            throw new DefiError(
                'createTonApiGaslessProvider: no eligible networks (configure at least one network in the kit, or pass `chains` matching a configured network)',
                DefiErrorCode.InvalidParams,
            );
        }

        return new TonApiGaslessProvider(chainConfig, config);
    }

    getSupportedNetworks(): Network[] {
        return Object.keys(this.chainConfig).map(networkFromChainId);
    }

    async getMetadata(): Promise<GaslessProviderMetadata> {
        return DEFAULT_METADATA;
    }

    async getConfig(network: Network): Promise<GaslessConfig> {
        if (!this.configCache) {
            return this.fetchConfig(network);
        }
        // `fetch` returns the cached value when fresh, otherwise runs `fetchMethod`.
        // The result is `undefined` only if `fetchMethod` is undefined or the
        // cache returns `forceRefresh: true` on a stale-while-revalidate path —
        // neither applies here.
        const value = await this.configCache.fetch(network.chainId, { context: network });
        if (!value) {
            throw new GaslessError('Gasless config cache returned no value', GaslessErrorCode.ConfigFailed);
        }
        return value;
    }

    private async fetchConfig(network: Network): Promise<GaslessConfig> {
        try {
            const http = this.getClient(network);
            const raw = await http.getJson<TonApiGaslessConfig>('/v2/gasless/config');
            return mapGaslessConfig(raw);
        } catch (error) {
            log.error('Failed to fetch gasless config', { error, chainId: network.chainId });
            throw mapTonApiGaslessError(error, GaslessErrorCode.ConfigFailed, 'Failed to fetch gasless config');
        }
    }

    async getQuote(params: GaslessQuoteParams): Promise<GaslessQuote> {
        if (!params.feeAsset) {
            throw new GaslessError(
                'TonAPI gasless requires `feeAsset` (jetton master). Free / sponsored modes are not supported by this provider.',
                GaslessErrorCode.UnsupportedOperation,
                { network: params.network.chainId },
            );
        }

        const masterId = Address.parse(params.feeAsset).toRawString();
        const body = buildGaslessQuoteRequest(params);

        try {
            const http = this.getClient(params.network);
            // Retry only the network request (5xx / network failures) with a fixed
            // delay — the quote is read-only and idempotent, so a flaky relayer
            // response is safe to re-request; 4xx are surfaced immediately via
            // `isTransientError`. Mapping runs once, outside the retry: it's
            // deterministic, so retrying it is pointless and would misclassify a
            // domain `GaslessError` as transient.
            const raw = await CallForSuccess(
                () => http.postJson<TonApiGaslessEstimateResponse>(`/v2/gasless/estimate/${masterId}`, body),
                this.quoteRetries + 1,
                this.quoteRetryDelayMs,
                isTransientError,
            );
            return mapGaslessQuote(raw, params.network);
        } catch (error) {
            log.error('Failed to quote gasless transaction', { error, params });
            throw mapTonApiGaslessError(error, GaslessErrorCode.QuoteFailed, 'Failed to quote gasless transaction');
        }
    }

    async sendTransaction(params: GaslessSendParams): Promise<GaslessSendResponse> {
        const body = buildGaslessSendRequest(params);
        const http = this.getClient(params.network);

        // Retry only the network request (5xx / network failures) with a fixed delay.
        // The wallet's seqno guard protects against on-chain double-spend if a retry
        // duplicates a BoC that was actually accepted; 4xx are surfaced immediately
        // (`isTransientError`) to keep relayer gas burn down. Mapping runs once,
        // outside the retry — a 2xx-but-unparseable response is a domain
        // `GaslessError(SEND_FAILED)` that must fail fast, not be re-sent.
        try {
            const raw = await CallForSuccess(
                () => http.postJson<TonApiGaslessSendResponse>('/v2/gasless/send', body),
                this.sendRetries + 1,
                this.sendRetryDelayMs,
                isTransientError,
            );
            return { ...mapGaslessSend(raw), internalBoc: params.internalBoc };
        } catch (error) {
            log.error('Failed to send gasless transaction', { error, chainId: params.network.chainId });
            throw mapTonApiGaslessError(error, GaslessErrorCode.SendFailed, 'Failed to send gasless transaction');
        }
    }

    private getClient(network: Network): ApiClientTonApi {
        const chainId = network.chainId;
        const perChain = this.chainConfig[chainId];

        if (!perChain) {
            throw new GaslessError(
                `TonApi gasless not configured for chain ${chainId}`,
                GaslessErrorCode.UnsupportedOperation,
                { chainId, configured: Object.keys(this.chainConfig) },
            );
        }

        if (!this.clients[chainId]) {
            this.clients[chainId] = new ApiClientTonApi({
                network,
                endpoint: perChain.endpoint,
                apiKey: perChain.apiKey,
            });
        }

        return this.clients[chainId];
    }
}

/**
 * Returns an AppKit / `ProviderInput` factory: pass to `providers: [createTonApiGaslessProvider(config)]`.
 * At kit init, the factory receives context and builds the provider using `ctx.networkManager`.
 */
export const createTonApiGaslessProvider = (
    config: TonApiGaslessProviderConfig = {},
): ((ctx: ProviderFactoryContext) => TonApiGaslessProvider) => {
    return (ctx: ProviderFactoryContext) => TonApiGaslessProvider.createFromContext(ctx, config);
};
