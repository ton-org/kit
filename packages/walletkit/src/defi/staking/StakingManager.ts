/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { TransactionRequest, UserFriendlyAddress, Network } from '../../api/models';
import type {
    StakeParams,
    StakingBalance,
    StakingProviderInfo,
    StakingProviderMetadata,
    StakingQuoteParams,
    StakingQuote,
} from '../../api/models';
import type { StakingAPI, StakingProviderInterface } from '../../api/interfaces';
import { globalLogger } from '../../core/Logger';
import { DefiManager } from '../DefiManager';
import { toDefiError } from '../errors';
import type { ProviderFactoryContext } from '../../types/factory';

const log = globalLogger.createChild('StakingManager');

/**
 * StakingManager - manages staking providers and delegates staking operations
 *
 * Allows registration of multiple staking providers and provides a unified API
 * for staking operations. Providers can be switched dynamically.
 */
export class StakingManager extends DefiManager<StakingProviderInterface> implements StakingAPI {
    constructor(createFactoryContext: () => ProviderFactoryContext) {
        super(createFactoryContext);
    }

    /**
     * Get a quote for staking or unstaking
     * @param params - Quote parameters
     * @param providerId - Optional provider id to use
     */
    async getQuote(params: StakingQuoteParams, providerId?: string): Promise<StakingQuote> {
        log.debug('Getting staking quote', params);
        try {
            const quote = await this.getProvider(providerId).getQuote(params);
            log.debug('Received staking quote', quote);
            return quote;
        } catch (error) {
            log.error('Failed to get staking quote', { error, params });
            throw toDefiError(error, 'Failed to get staking quote');
        }
    }

    /**
     * Stake GRAM using a provider
     * @param params - Staking parameters
     * @param providerId - Optional provider id to use
     */
    async buildStakeTransaction(params: StakeParams, providerId?: string): Promise<TransactionRequest> {
        log.debug('Building staking transaction', params);
        try {
            return await this.getProvider(providerId).buildStakeTransaction(params);
        } catch (error) {
            log.error('Failed to build staking transaction', { error, params });
            throw toDefiError(error, 'Failed to build staking transaction');
        }
    }

    /**
     * Get staking balance for a user
     * @param userAddress - User address
     * @param network - Network to query
     * @param providerId - Optional provider id to use
     */
    async getStakedBalance(
        userAddress: UserFriendlyAddress,
        network?: Network,
        providerId?: string,
    ): Promise<StakingBalance> {
        log.debug('Getting staking balance', {
            userAddress,
            network,
            provider: providerId || this.defaultProviderId,
        });

        try {
            return await this.getProvider(providerId).getStakedBalance(userAddress, network);
        } catch (error) {
            log.error('Failed to get staking balance', { error, userAddress, network });
            throw toDefiError(error, 'Failed to get staking balance');
        }
    }

    /**
     * Get staking information for a network
     * @param network - Network to query
     * @param providerId - Optional provider id to use
     */
    async getStakingProviderInfo(network?: Network, providerId?: string): Promise<StakingProviderInfo> {
        log.debug('Getting staking info', {
            network,
            provider: providerId || this.defaultProviderId,
        });

        try {
            return await this.getProvider(providerId).getStakingProviderInfo(network);
        } catch (error) {
            log.error('Failed to get staking info', { error, network });
            throw toDefiError(error, 'Failed to get staking info');
        }
    }

    /**
     * Get static staking provider metadata for a network
     * @param network - Network to query
     * @param providerId - Optional provider id to use
     */
    getStakingProviderMetadata(network?: Network, providerId?: string): StakingProviderMetadata {
        log.debug('Getting staking metadata', {
            network,
            provider: providerId || this.defaultProviderId,
        });

        try {
            return this.getProvider(providerId).getStakingProviderMetadata(network);
        } catch (error) {
            log.error('Failed to get staking metadata', { error, network });
            throw toDefiError(error, 'Failed to get staking metadata');
        }
    }
}
