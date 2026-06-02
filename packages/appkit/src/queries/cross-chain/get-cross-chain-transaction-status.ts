/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { getCrossChainTransactionStatus } from '../../actions';
import type { GetCrossChainTransactionStatusParameters, GetCrossChainTransactionStatusReturnType } from '../../actions';
import type { AppKit } from '../../core/app-kit';
import type { QueryOptions, QueryParameter } from '../../types/query';
import type { Compute } from '../../types/utils';

export type { GetCrossChainTransactionStatusParameters, GetCrossChainTransactionStatusReturnType };

export type GetCrossChainTransactionStatusData = Compute<GetCrossChainTransactionStatusReturnType>;

export type GetCrossChainTransactionStatusErrorType = Error;

export type GetCrossChainTransactionStatusQueryKey = readonly ['cross-chain', 'transaction-status', string, string];

export type GetCrossChainTransactionStatusQueryConfig<selectData = GetCrossChainTransactionStatusData> = QueryParameter<
    GetCrossChainTransactionStatusData,
    GetCrossChainTransactionStatusErrorType,
    selectData,
    GetCrossChainTransactionStatusQueryKey
>;

export type GetCrossChainTransactionStatusQueryOptions<selectData = GetCrossChainTransactionStatusData> = QueryOptions<
    GetCrossChainTransactionStatusData,
    GetCrossChainTransactionStatusErrorType,
    selectData,
    GetCrossChainTransactionStatusQueryKey
>;

export const getCrossChainTransactionStatusQueryOptions = <selectData = GetCrossChainTransactionStatusData>(
    appKit: AppKit,
    options: GetCrossChainTransactionStatusParameters & GetCrossChainTransactionStatusQueryConfig<selectData>,
): GetCrossChainTransactionStatusQueryOptions<selectData> => {
    return {
        ...options.query,
        queryFn: () => {
            return getCrossChainTransactionStatus(appKit, options);
        },
        queryKey: ['cross-chain', 'transaction-status', options.providerId, options.transactionHash] as const,
    };
};
