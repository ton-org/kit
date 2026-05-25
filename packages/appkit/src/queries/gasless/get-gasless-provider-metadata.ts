/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { getGaslessProviderMetadata } from '../../actions/gasless/get-gasless-provider-metadata';
import type {
    GetGaslessProviderMetadataErrorType,
    GetGaslessProviderMetadataOptions,
    GetGaslessProviderMetadataReturnType,
} from '../../actions/gasless/get-gasless-provider-metadata';
import type { AppKit } from '../../core/app-kit';
import type { QueryOptions, QueryParameter } from '../../types/query';
import type { Compute, ExactPartial } from '../../types/utils';
import { filterQueryOptions } from '../../utils';

export type { GetGaslessProviderMetadataErrorType };

export type GetGaslessProviderMetadataQueryConfig<selectData = GetGaslessProviderMetadataData> = Compute<
    ExactPartial<GetGaslessProviderMetadataOptions>
> &
    QueryParameter<
        GetGaslessProviderMetadataQueryFnData,
        GetGaslessProviderMetadataErrorType,
        selectData,
        GetGaslessProviderMetadataQueryKey
    >;

export const getGaslessProviderMetadataQueryOptions = <selectData = GetGaslessProviderMetadataData>(
    appKit: AppKit,
    options: GetGaslessProviderMetadataQueryConfig<selectData> = {},
): GetGaslessProviderMetadataQueryOptions<selectData> => {
    return {
        ...options.query,
        queryFn: async (context) => {
            const [, parameters] = context.queryKey as [string, GetGaslessProviderMetadataOptions];
            return getGaslessProviderMetadata(appKit, parameters);
        },
        queryKey: getGaslessProviderMetadataQueryKey(options),
    };
};

export type GetGaslessProviderMetadataQueryFnData = Compute<Awaited<GetGaslessProviderMetadataReturnType>>;

export type GetGaslessProviderMetadataData = GetGaslessProviderMetadataQueryFnData;

export const getGaslessProviderMetadataQueryKey = (
    options: Compute<ExactPartial<GetGaslessProviderMetadataOptions>> = {},
): GetGaslessProviderMetadataQueryKey => {
    return ['gaslessProviderMetadata', filterQueryOptions(options as unknown as Record<string, unknown>)] as const;
};

export type GetGaslessProviderMetadataQueryKey = readonly [
    'gaslessProviderMetadata',
    Compute<ExactPartial<GetGaslessProviderMetadataOptions>>,
];

export type GetGaslessProviderMetadataQueryOptions<selectData = GetGaslessProviderMetadataData> = QueryOptions<
    GetGaslessProviderMetadataQueryFnData,
    GetGaslessProviderMetadataErrorType,
    selectData,
    GetGaslessProviderMetadataQueryKey
>;
