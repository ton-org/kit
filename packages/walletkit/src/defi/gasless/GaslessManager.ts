/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { GaslessAPI, GaslessProviderInterface } from '../../api/interfaces';
import type {
    GaslessConfig,
    GaslessProviderMetadata,
    GaslessQuote,
    GaslessQuoteParams,
    GaslessSendParams,
    GaslessSendResponse,
    Network,
} from '../../api/models';
import { globalLogger } from '../../core/Logger';
import type { ProviderFactoryContext } from '../../types/factory';
import { DefiManager } from '../DefiManager';
import type { GaslessErrorCode } from './errors';
import { GaslessError } from './errors';

const log = globalLogger.createChild('GaslessManager');

/**
 * GaslessManager — manages gasless relay providers and delegates gasless operations.
 *
 * Allows registration of multiple gasless providers and provides a unified API.
 * Providers can be switched dynamically.
 */
export class GaslessManager extends DefiManager<GaslessProviderInterface> implements GaslessAPI {
    constructor(createFactoryContext: () => ProviderFactoryContext) {
        super(createFactoryContext);
    }

    /**
     * Get static metadata for a gasless provider (display name, logo, url).
     */
    async getMetadata(providerId?: string): Promise<GaslessProviderMetadata> {
        const selectedProviderId = providerId ?? this.defaultProviderId;
        log.debug('Getting gasless provider metadata', { providerId: selectedProviderId });

        try {
            return await this.getProvider(selectedProviderId).getMetadata();
        } catch (error) {
            log.error('Failed to get gasless provider metadata', { error });
            throw error;
        }
    }

    /**
     * Fetch the relayer's configuration (relay address + accepted fee assets).
     *
     * `network` defaults to the provider's first supported network.
     */
    async getConfig(network?: Network, providerId?: string): Promise<GaslessConfig> {
        const provider = this.getProvider(providerId ?? this.defaultProviderId);
        const targetNetwork = network ?? provider.getSupportedNetworks()[0];
        log.debug('Getting gasless config', {
            network: targetNetwork?.chainId,
            providerId: providerId ?? this.defaultProviderId,
        });

        try {
            return await provider.getConfig(targetNetwork);
        } catch (error) {
            log.error('Failed to get gasless config', { error });
            throw error;
        }
    }

    /**
     * Quote fees and obtain relayer-wrapped messages for signing.
     */
    async getQuote(params: GaslessQuoteParams, providerId?: string): Promise<GaslessQuote> {
        log.debug('Quoting gasless transaction', {
            network: params.network.chainId,
            walletAddress: params.walletAddress,
            feeAsset: params.feeAsset,
            messagesCount: params.messages.length,
            providerId: providerId ?? this.defaultProviderId,
        });

        try {
            return await this.getProvider(providerId ?? this.defaultProviderId).getQuote(params);
        } catch (error) {
            log.error('Failed to quote gasless transaction', { error, params });
            throw error;
        }
    }

    /**
     * Submit a signed transaction BoC to the relayer.
     */
    async sendTransaction(params: GaslessSendParams, providerId?: string): Promise<GaslessSendResponse> {
        log.debug('Sending gasless transaction', {
            network: params.network.chainId,
            providerId: providerId ?? this.defaultProviderId,
        });

        try {
            return await this.getProvider(providerId ?? this.defaultProviderId).sendTransaction(params);
        } catch (error) {
            log.error('Failed to send gasless transaction', { error });
            throw error;
        }
    }

    protected createError(message: string, code: string, details?: unknown): GaslessError {
        return new GaslessError(message, code as GaslessErrorCode, details);
    }
}
