/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { ApiClient } from '../api/interfaces';
import type { CrossChainTransactionParams } from '../api/models/cross-chain/CrossChainTransactionParams';
import type { BaseProvider, TransactionRequest, TransactionStatusResponse } from '../api/models';

/**
 * Abstract interface for cross-chain providers
 *
 * Provides a common interface for implementing cross-chain functionality
 * across different protocols.
 *
 * @example
 * ```typescript
 * class MyCrossChainProvider implements CrossChainProvider {
 *   async buildCrossChainTransaction(parameters: CrossChainTransactionParams): Promise<TransactionRequest> {
 *     // ...
 *   }
 *
 *   async getSmartAccountAddress(walletAddress: string, applicationAddress: string): Promise<string> {
 *     // ...
 *   }
 * }
 * ```
 */
export interface CrossChainProvider extends BaseProvider {
    type: 'cross-chain';

    /**
     * Unique identifier for the provider
     */
    providerId: string;

    /**
     * Build a transaction for executing a cross-chain operation
     * @param {CrossChainTransactionParams<never>} parameters - Parameters for the cross-chain transaction
     * @returns {Promise<TransactionRequest>} Promise resolving to transaction request
     */
    buildCrossChainTransaction: (parameters: CrossChainTransactionParams<never>) => Promise<TransactionRequest>;

    /**
     * Get the smart account address for a given wallet and application
     * @param {string} walletAddress - The user's wallet address
     * @param {string} applicationAddress - The application address
     * @returns {Promise<string>} Promise resolving to the smart account address
     */
    getSmartAccountAddress: (walletAddress: string, applicationAddress: string) => Promise<string>;

    /**
     * Get the status of a cross-chain transaction
     * @param {string} transactionHash - The hash of the transaction
     * @param {ApiClient} [client] - Optional API client
     * @returns {Promise<TransactionStatusResponse>} Promise resolving to the transaction status
     */
    getTransactionStatus: (transactionHash: string, client?: ApiClient) => Promise<TransactionStatusResponse>;
}
