/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { getStakingProviderMetadata } from '../../actions/staking/get-staking-provider-metadata';
import type {
    GetStakingProviderMetadataOptions,
    GetStakingProviderMetadataReturnType,
} from '../../actions/staking/get-staking-provider-metadata';
import type { AppKit } from '../../core/app-kit';
import type { QueryOptions, QueryParameter } from '../../types/query';
import type { Compute, ExactPartial } from '../../types/utils';
import { filterQueryOptions, resolveNetwork } from '../../utils';

export type GetStakingProviderMetadataErrorType = Error;

export type GetStakingProviderMetadataQueryConfig<selectData = GetStakingProviderMetadataData> = Compute<
    ExactPartial<GetStakingProviderMetadataOptions>
> &
    QueryParameter<
        GetStakingProviderMetadataQueryFnData,
        GetStakingProviderMetadataErrorType,
        selectData,
        GetStakingProviderMetadataQueryKey
    >;

export const getStakingProviderMetadataQueryOptions = <selectData = GetStakingProviderMetadataData>(
    appKit: AppKit,
    initialOptions: GetStakingProviderMetadataQueryConfig<selectData> = {},
): GetStakingProviderMetadataQueryOptions<selectData> => {
    const network = resolveNetwork(appKit, initialOptions.network);
    const options = { ...initialOptions, network };

    return {
        ...options.query,
        queryFn: async (context) => {
            const [, parameters] = context.queryKey as [string, GetStakingProviderMetadataOptions];
            return getStakingProviderMetadata(appKit, parameters);
        },
        queryKey: getStakingProviderMetadataQueryKey(options),
    };
};

export type GetStakingProviderMetadataQueryFnData = Compute<Awaited<GetStakingProviderMetadataReturnType>>;

export type GetStakingProviderMetadataData = GetStakingProviderMetadataQueryFnData;

export const getStakingProviderMetadataQueryKey = (
    options: Compute<ExactPartial<GetStakingProviderMetadataOptions>> = {},
): GetStakingProviderMetadataQueryKey => {
    return ['stakingProviderMetadata', filterQueryOptions(options)] as const;
};

export type GetStakingProviderMetadataQueryKey = readonly [
    'stakingProviderMetadata',
    Compute<ExactPartial<GetStakingProviderMetadataOptions>>,
];

export type GetStakingProviderMetadataQueryOptions<selectData = GetStakingProviderMetadataData> = QueryOptions<
    GetStakingProviderMetadataQueryFnData,
    GetStakingProviderMetadataErrorType,
    selectData,
    GetStakingProviderMetadataQueryKey
>;
