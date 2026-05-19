/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { getStakingSupportedNetworks } from '../../actions/staking/get-staking-supported-networks';
import type {
    GetStakingSupportedNetworksOptions,
    GetStakingSupportedNetworksReturnType,
} from '../../actions/staking/get-staking-supported-networks';
import type { AppKit } from '../../core/app-kit';
import type { QueryOptions, QueryParameter } from '../../types/query';
import type { Compute, ExactPartial } from '../../types/utils';
import { filterQueryOptions } from '../../utils';

export type GetStakingSupportedNetworksErrorType = Error;

export type GetStakingSupportedNetworksQueryConfig<selectData = GetStakingSupportedNetworksData> = Compute<
    ExactPartial<GetStakingSupportedNetworksOptions>
> &
    QueryParameter<
        GetStakingSupportedNetworksQueryFnData,
        GetStakingSupportedNetworksErrorType,
        selectData,
        GetStakingSupportedNetworksQueryKey
    >;

export const getStakingSupportedNetworksQueryOptions = <selectData = GetStakingSupportedNetworksData>(
    appKit: AppKit,
    options: GetStakingSupportedNetworksQueryConfig<selectData> = {},
): GetStakingSupportedNetworksQueryOptions<selectData> => {
    return {
        ...options.query,
        queryFn: async (context) => {
            const [, parameters] = context.queryKey as [string, GetStakingSupportedNetworksOptions];
            return getStakingSupportedNetworks(appKit, parameters);
        },
        queryKey: getStakingSupportedNetworksQueryKey(options),
    };
};

export type GetStakingSupportedNetworksQueryFnData = Compute<Awaited<GetStakingSupportedNetworksReturnType>>;

export type GetStakingSupportedNetworksData = GetStakingSupportedNetworksQueryFnData;

export const getStakingSupportedNetworksQueryKey = (
    options: Compute<ExactPartial<GetStakingSupportedNetworksOptions>> = {},
): GetStakingSupportedNetworksQueryKey => {
    return ['stakingSupportedNetworks', filterQueryOptions(options)] as const;
};

export type GetStakingSupportedNetworksQueryKey = readonly [
    'stakingSupportedNetworks',
    Compute<ExactPartial<GetStakingSupportedNetworksOptions>>,
];

export type GetStakingSupportedNetworksQueryOptions<selectData = GetStakingSupportedNetworksData> = QueryOptions<
    GetStakingSupportedNetworksQueryFnData,
    GetStakingSupportedNetworksErrorType,
    selectData,
    GetStakingSupportedNetworksQueryKey
>;
