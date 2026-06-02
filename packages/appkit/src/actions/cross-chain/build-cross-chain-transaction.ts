/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { TransactionRequest } from '@ton/walletkit';

import type { AppKit } from '../../core/app-kit';

export interface BuildCrossChainTransactionOptions<T = unknown> {
    /**
     * The transaction parameters.
     */
    parameters: T;

    /**
     * The required ID of the cross-chain provider to use.
     */
    providerId: string;
}

export type BuildCrossChainTransactionReturnType = Promise<TransactionRequest>;

/**
 * Builds a cross-chain transaction.
 *
 * @param appKit - The AppKit instance.
 * @param options - The transaction options.
 * @returns The built transaction request.
 */
export async function buildCrossChainTransaction<T = unknown>(
    appKit: AppKit,
    options: BuildCrossChainTransactionOptions<T>,
): BuildCrossChainTransactionReturnType {
    const provider = appKit.crossChainManager.getProvider(options.providerId);
    return await provider.buildCrossChainTransaction(options.parameters as never);
}
