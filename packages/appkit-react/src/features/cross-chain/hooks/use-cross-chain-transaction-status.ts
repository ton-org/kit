/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
    GetCrossChainTransactionStatusData,
    GetCrossChainTransactionStatusErrorType,
    GetCrossChainTransactionStatusParameters,
    GetCrossChainTransactionStatusQueryConfig,
} from '@ton/appkit/queries';
import { getCrossChainTransactionStatusQueryOptions } from '@ton/appkit/queries';

import { useQuery } from '../../../libs/query';
import type { UseQueryReturnType } from '../../../libs/query';
import { useAppKit } from '../../settings';

export type UseCrossChainTransactionStatusParameters<selectData = GetCrossChainTransactionStatusData> =
    GetCrossChainTransactionStatusParameters & GetCrossChainTransactionStatusQueryConfig<selectData>;

export type UseCrossChainTransactionStatusReturnType<selectData = GetCrossChainTransactionStatusData> =
    UseQueryReturnType<selectData, GetCrossChainTransactionStatusErrorType>;

/**
 * Hook for tracking cross-chain transactions.
 *
 * This hook polls the cross-chain provider to track the progress of a cross-chain transaction.
 *
 * @example
 * ```ts
 * const { data: status } = useCrossChainTransactionStatus({
 *   transactionHash: '...',
 *   providerId: 'tac',
 *   query: {
 *     refetchInterval: 2000,
 *   }
 * });
 * ```
 */
export const useCrossChainTransactionStatus = <selectData = GetCrossChainTransactionStatusData>(
    parameters: UseCrossChainTransactionStatusParameters<selectData>,
): UseCrossChainTransactionStatusReturnType<selectData> => {
    const appKit = useAppKit();

    return useQuery(getCrossChainTransactionStatusQueryOptions(appKit, parameters));
};
