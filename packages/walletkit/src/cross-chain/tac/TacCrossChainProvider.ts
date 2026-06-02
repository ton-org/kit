/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { AssetLike, EvmProxyMsg } from '@tonappchain/sdk';
import { Network as TacSdkNetwork, TacSdk } from '@tonappchain/sdk';

import type { ApiClient, CrossChainProvider } from '../../api/interfaces';
import type { Base64String, TransactionRequest, TransactionStatusResponse } from '../../api/models';
import { Network } from '../../api/models';
import { CrossChainError, CrossChainErrorCode } from '../errors';
import type { TacCrossChainProviderConfig } from './TacCrossChainProviderConfig';
import type { TacCrossChainTransactionParams } from './TacCrossChainTransactionParams';
import { getTransactionStatus } from '../../utils';
import type { NetworkManager } from '../../core/NetworkManager';
import type { ProviderFactoryContext } from '../../types/factory';

/**
 * TacCrossChainProvider - implementation of CrossChainProvider for TAC (TON Application Chain)
 *
 * This provider should only be created via the {@link createTacProvider()} function.
 *
 * @example
 * ```typescript
 * const tacProvider = createTacProvider();
 *
 * new AppKit({
 *     networks: { ... },
 *     connectors: [ ... ],
 *     providers: [ tacProvider ],
 * });
 * ```
 */
export class TacCrossChainProvider implements CrossChainProvider {
    readonly type = 'cross-chain';
    readonly providerId = 'tac';
    readonly network: Network;
    private readonly networkManager: NetworkManager;
    private readonly config: TacCrossChainProviderConfig;

    sdk: TacSdk | undefined;
    private sdkPromise: Promise<TacSdk> | undefined;

    constructor(networkManager: NetworkManager, config?: TacCrossChainProviderConfig, sdk?: TacSdk) {
        this.networkManager = networkManager;
        this.config = config || {};
        this.network = config?.network || Network.mainnet();
        this.sdk = sdk;
    }

    private async getSdk(): Promise<TacSdk> {
        if (this.sdk) {
            return this.sdk;
        }

        if (!this.sdkPromise) {
            this.sdkPromise = TacSdk.create({
                ...(this.config.sdkConfig || {}),
                network: TacCrossChainProvider.getTacSdkNetworkByTonNetwork(this.config?.network || Network.mainnet()),
            }).then((sdk) => {
                this.sdk = sdk;
                return sdk;
            });
        }

        return this.sdkPromise;
    }

    static getTacSdkNetworkByTonNetwork(tonNetwork: Network): TacSdkNetwork {
        switch (tonNetwork.chainId) {
            case Network.mainnet().chainId:
                return TacSdkNetwork.MAINNET;
            case Network.testnet().chainId:
                return TacSdkNetwork.TESTNET;
            default:
                throw new CrossChainError(
                    `TacCrossChainProvider does not support chain ${tonNetwork.chainId}`,
                    CrossChainErrorCode.UnsupportedNetwork,
                    { network: tonNetwork },
                );
        }
    }

    static async create(networkManager: NetworkManager, config: TacCrossChainProviderConfig) {
        const sdkInstance = await TacSdk.create({
            ...config.sdkConfig,
            network: this.getTacSdkNetworkByTonNetwork(config.network || Network.mainnet()),
        });

        return new TacCrossChainProvider(networkManager, config, sdkInstance);
    }

    static createFromContext(ctx: ProviderFactoryContext, config?: TacCrossChainProviderConfig) {
        const networkManager = ctx.networkManager;
        return new TacCrossChainProvider(networkManager, config);
    }

    /**
     * Get supported networks for this provider
     * @returns {Network[]} Array of networks supported by this provider
     */
    getSupportedNetworks(): Network[] {
        return [this.network];
    }

    private getApiClient(network?: Network): ApiClient {
        const targetNetwork = network ?? this.network;
        return this.networkManager.getClient(targetNetwork);
    }

    /**
     * Get the smart account address for a given wallet and application
     * @param {string} walletAddress - The user's wallet address
     * @param {string} applicationAddress - The application address
     * @returns {Promise<string>} Promise resolving to the smart account address
     */
    async getSmartAccountAddress(walletAddress: string, applicationAddress: string): Promise<string> {
        const sdk = await this.getSdk();
        return sdk.getSmartAccountAddressForTvmWallet(walletAddress, applicationAddress);
    }

    /**
     * Get the status of a TON transaction
     * @param {string} transactionHash - The hash of the transaction
     * @param {ApiClient} [client] - Optional API client
     * @returns {Promise<TransactionStatusResponse>} Promise resolving to the transaction status
     */
    async getTransactionStatus(transactionHash: string, client?: ApiClient): Promise<TransactionStatusResponse> {
        return await getTransactionStatus(client ?? this.getApiClient(this.network), {
            normalizedHash: transactionHash,
        });
    }

    /**
     * Build a transaction for executing a cross-chain operation
     * @param {TacCrossChainTransactionParams<EvmProxyMsg, AssetLike[]>} parameters - Parameters for the cross-chain transaction
     * @returns {Promise<TransactionRequest>} Promise resolving to transaction request
     */
    async buildCrossChainTransaction(
        parameters: TacCrossChainTransactionParams<EvmProxyMsg, AssetLike[]>,
    ): Promise<TransactionRequest> {
        const sdk = await this.getSdk();
        const network = this.getSupportedNetworks()?.[0];
        if (!network) {
            throw new CrossChainError('No supported networks configured', CrossChainErrorCode.InvalidProvider);
        }

        const results = await sdk.prepareCrossChainTransactionPayload(
            parameters.message,
            parameters.senderAddress,
            parameters.assets,
            parameters.options || undefined,
        );

        const messages = results.map((result) => ({
            address: result.destinationAddress,
            amount: result.tonAmount.toString(),
            payload: result.body.toBoc().toString('base64') as Base64String,
        }));

        return { messages, network } as TransactionRequest;
    }
}

/**
 * Creates a TAC cross-chain provider factory
 * @param {TacCrossChainProviderConfig} [config] - Optional configuration for the TAC provider
 * @returns {(ctx: ProviderFactoryContext) => TacCrossChainProvider} A function that takes a ProviderFactoryContext and returns a TacCrossChainProvider instance
 */
export const createTacProvider = (
    config?: TacCrossChainProviderConfig,
): ((ctx: ProviderFactoryContext) => TacCrossChainProvider) => {
    return (ctx) => TacCrossChainProvider.createFromContext(ctx, config);
};
