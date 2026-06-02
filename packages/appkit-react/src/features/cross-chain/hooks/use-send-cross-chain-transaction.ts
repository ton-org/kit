/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { buildCrossChainTransaction, sendTransaction } from '@ton/appkit';
import { useCallback } from 'react';

import { useAppKit } from '../../settings';

export interface UseSendCrossChainTransactionParameters {
    providerId?: string;
}

/**
 * Hook for sending cross-chain transactions.
 */
export const useSendCrossChainTransaction = (parameters: UseSendCrossChainTransactionParameters = {}) => {
    const { providerId } = parameters;
    const appKit = useAppKit();

    const send = useCallback(
        async (txParameters: unknown) => {
            if (!providerId) {
                throw new Error('Provider ID is required');
            }

            const transactionRequest = await buildCrossChainTransaction(appKit, {
                providerId,
                parameters: txParameters,
            });

            return sendTransaction(appKit, transactionRequest);
        },
        [appKit, providerId],
    );

    return { send };
};
