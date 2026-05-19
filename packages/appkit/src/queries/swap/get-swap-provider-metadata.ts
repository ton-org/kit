/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { getSwapProviderMetadata } from '../../actions/swap/get-swap-provider-metadata';
import type {
    GetSwapProviderMetadataOptions,
    GetSwapProviderMetadataReturnType,
} from '../../actions/swap/get-swap-provider-metadata';
import type { AppKit } from '../../core/app-kit';
import type { QueryOptions, QueryParameter } from '../../types/query';
import type { Compute, ExactPartial } from '../../types/utils';
import { filterQueryOptions } from '../../utils';

export type GetSwapProviderMetadataErrorType = Error;

export type GetSwapProviderMetadataQueryConfig<selectData = GetSwapProviderMetadataData> = Compute<
    ExactPartial<GetSwapProviderMetadataOptions>
> &
    QueryParameter<
        GetSwapProviderMetadataQueryFnData,
        GetSwapProviderMetadataErrorType,
        selectData,
        GetSwapProviderMetadataQueryKey
    >;

export const getSwapProviderMetadataQueryOptions = <selectData = GetSwapProviderMetadataData>(
    appKit: AppKit,
    options: GetSwapProviderMetadataQueryConfig<selectData> = {},
): GetSwapProviderMetadataQueryOptions<selectData> => {
    return {
        ...options.query,
        queryFn: async (context) => {
            const [, parameters] = context.queryKey as [string, GetSwapProviderMetadataOptions];
            return getSwapProviderMetadata(appKit, parameters);
        },
        queryKey: getSwapProviderMetadataQueryKey(options),
    };
};

export type GetSwapProviderMetadataQueryFnData = Compute<Awaited<GetSwapProviderMetadataReturnType>>;

export type GetSwapProviderMetadataData = GetSwapProviderMetadataQueryFnData;

export const getSwapProviderMetadataQueryKey = (
    options: Compute<ExactPartial<GetSwapProviderMetadataOptions>> = {},
): GetSwapProviderMetadataQueryKey => {
    return ['swapProviderMetadata', filterQueryOptions(options)] as const;
};

export type GetSwapProviderMetadataQueryKey = readonly [
    'swapProviderMetadata',
    Compute<ExactPartial<GetSwapProviderMetadataOptions>>,
];

export type GetSwapProviderMetadataQueryOptions<selectData = GetSwapProviderMetadataData> = QueryOptions<
    GetSwapProviderMetadataQueryFnData,
    GetSwapProviderMetadataErrorType,
    selectData,
    GetSwapProviderMetadataQueryKey
>;
