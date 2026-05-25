/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Address } from '@ton/core';

import type {
    GaslessConfig,
    GaslessEstimateParams,
    GaslessEstimateResult,
    GaslessSendParams,
} from '../../../api/models';
import { Network } from '../../../api/models';
import { BaseApiClient } from '../../../clients/BaseApiClient';
import { globalLogger } from '../../../core/Logger';
import type { ProviderFactoryContext } from '../../../types/factory';
import { CallForSuccess } from '../../../utils/retry';
import { GaslessError, GaslessErrorCode } from '../errors';
import { GaslessProvider } from '../GaslessProvider';
import { mapGaslessConfig } from './mappers/map-gasless-config';
import { buildGaslessEstimateRequest, mapGaslessEstimate } from './mappers/map-gasless-estimate';
import { buildGaslessSendRequest } from './mappers/map-gasless-send';
import type { TonApiGaslessConfig } from './types/config';
import type { TonApiGaslessEstimateResponse } from './types/estimate';

const log = globalLogger.createChild('TonApiGaslessProvider');

const DEFAULT_SEND_RETRIES = 5;
const DEFAULT_SEND_RETRY_DELAY_MS = 2000;

const defaultEndpoint = (network: Network): string => {
    switch (network.chainId) {
        case Network.mainnet().chainId:
            return 'https://tonapi.io';
        case Network.tetra().chainId:
            return 'https://tetra.tonapi.io';
        default:
            return 'https://testnet.tonapi.io';
    }
};

class TonApiHttpClient extends BaseApiClient {
    protected appendAuthHeaders(headers: Headers): void {
        if (this.apiKey) {
            headers.set('Authorization', `Bearer ${this.apiKey}`);
        }
    }
}

/**
 * Configuration for `TonApiGaslessProvider`.
 *
 * Shape mirrors `TonApiStreamingProviderConfig` — one provider instance per
 * network. To support both mainnet and testnet, register two providers.
 */
export interface TonApiGaslessProviderConfig {
    /** Network this provider operates on. Determines the default endpoint. */
    network: Network;
    /** Optional TonAPI REST endpoint override. */
    endpoint?: string;
    /** Optional bearer token for TonAPI. */
    apiKey?: string;
    /** Optional fetch implementation override (testing / SSR). */
    fetchApi?: typeof fetch;
    /** Optional provider id override. Defaults to `tonapi-${network.chainId}`. */
    providerId?: string;
    /** Number of send retries on transient errors. Defaults to 5. */
    sendRetries?: number;
    /** Delay between send retries in ms. Defaults to 2000. */
    sendRetryDelayMs?: number;
}

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
 *     network: Network.mainnet(),
 *     apiKey: process.env.TON_API_KEY,
 * });
 *
 * kit.gasless.registerProvider(provider);
 * ```
 */
export class TonApiGaslessProvider extends GaslessProvider {
    readonly providerId: string;

    private readonly network: Network;
    private readonly http: TonApiHttpClient;
    private readonly sendRetries: number;
    private readonly sendRetryDelayMs: number;

    constructor(config: TonApiGaslessProviderConfig) {
        super();
        this.network = config.network;
        this.providerId = config.providerId ?? `tonapi-${config.network.chainId}`;
        this.sendRetries = config.sendRetries ?? DEFAULT_SEND_RETRIES;
        this.sendRetryDelayMs = config.sendRetryDelayMs ?? DEFAULT_SEND_RETRY_DELAY_MS;
        this.http = new TonApiHttpClient(
            {
                endpoint: config.endpoint,
                apiKey: config.apiKey,
                fetchApi: config.fetchApi,
                network: config.network,
            },
            defaultEndpoint(config.network),
        );
    }

    getSupportedNetworks(): Network[] {
        return [this.network];
    }

    async getConfig(): Promise<GaslessConfig> {
        try {
            const raw = await this.http.getJson<TonApiGaslessConfig>('/v2/gasless/config');
            return mapGaslessConfig(raw);
        } catch (error) {
            log.error('Failed to fetch gasless config', { error });
            throw new GaslessError(
                error instanceof Error ? error.message : 'Failed to fetch gasless config',
                GaslessErrorCode.ConfigFailed,
                error,
            );
        }
    }

    async estimate(params: GaslessEstimateParams): Promise<GaslessEstimateResult> {
        const masterId = Address.parse(params.feeJettonMaster).toRawString();
        const body = buildGaslessEstimateRequest(params);

        try {
            const raw = await this.http.postJson<TonApiGaslessEstimateResponse>(
                `/v2/gasless/estimate/${masterId}`,
                body,
            );
            return mapGaslessEstimate(raw);
        } catch (error) {
            log.error('Failed to estimate gasless transaction', { error, params });
            throw new GaslessError(
                error instanceof Error ? error.message : 'Failed to estimate gasless transaction',
                GaslessErrorCode.EstimateFailed,
                error,
            );
        }
    }

    async send(params: GaslessSendParams): Promise<void> {
        const body = buildGaslessSendRequest(params);

        try {
            await CallForSuccess(
                () => this.http.postJson('/v2/gasless/send', body),
                this.sendRetries,
                this.sendRetryDelayMs,
            );
        } catch (error) {
            log.error('Failed to send gasless transaction', { error });
            throw new GaslessError(
                error instanceof Error ? error.message : 'Failed to send gasless transaction',
                GaslessErrorCode.SendFailed,
                error,
            );
        }
    }
}

/**
 * Factory for `TonApiGaslessProvider` matching the `(ctx) => Provider` shape
 * expected by `AppKit.registerProvider`.
 */
export const createTonApiGaslessProvider = (
    config: TonApiGaslessProviderConfig,
): ((ctx: ProviderFactoryContext) => TonApiGaslessProvider) => {
    return () => new TonApiGaslessProvider(config);
};
