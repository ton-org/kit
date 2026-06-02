/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { TransactionStatusResponse } from '@ton/walletkit';

import type { AppKit } from '../../core/app-kit';

export type GetCrossChainTransactionStatusParameters = {
    /**
     * The transaction hash to check.
     */
    transactionHash: string;

    /**
     * The ID of the cross-chain provider to use.
     */
    providerId: string;
};

export type GetCrossChainTransactionStatusReturnType = TransactionStatusResponse;

/**
 * Gets the status of a cross-chain transaction.
 *
 * @param appKit - The AppKit instance.
 * @param options - The options for getting the status.
 * @returns The transaction status response.
 */
export async function getCrossChainTransactionStatus(
    appKit: AppKit,
    options: GetCrossChainTransactionStatusParameters,
): Promise<GetCrossChainTransactionStatusReturnType> {
    const provider = appKit.crossChainManager.getProvider(options.providerId);
    return provider.getTransactionStatus(options.transactionHash);
}
