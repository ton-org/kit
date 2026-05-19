/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { getSwapSupportedNetworks } from '../../actions/swap/get-swap-supported-networks';
import type {
    GetSwapSupportedNetworksOptions,
    GetSwapSupportedNetworksReturnType,
} from '../../actions/swap/get-swap-supported-networks';
import type { AppKit } from '../../core/app-kit';
import type { QueryOptions, QueryParameter } from '../../types/query';
import type { Compute, ExactPartial } from '../../types/utils';
import { filterQueryOptions } from '../../utils';

export type GetSwapSupportedNetworksErrorType = Error;

export type GetSwapSupportedNetworksQueryConfig<selectData = GetSwapSupportedNetworksData> = Compute<
    ExactPartial<GetSwapSupportedNetworksOptions>
> &
    QueryParameter<
        GetSwapSupportedNetworksQueryFnData,
        GetSwapSupportedNetworksErrorType,
        selectData,
        GetSwapSupportedNetworksQueryKey
    >;

export const getSwapSupportedNetworksQueryOptions = <selectData = GetSwapSupportedNetworksData>(
    appKit: AppKit,
    options: GetSwapSupportedNetworksQueryConfig<selectData> = {},
): GetSwapSupportedNetworksQueryOptions<selectData> => {
    return {
        ...options.query,
        queryFn: async (context) => {
            const [, parameters] = context.queryKey as [string, GetSwapSupportedNetworksOptions];
            return getSwapSupportedNetworks(appKit, parameters);
        },
        queryKey: getSwapSupportedNetworksQueryKey(options),
    };
};

export type GetSwapSupportedNetworksQueryFnData = Compute<Awaited<GetSwapSupportedNetworksReturnType>>;

export type GetSwapSupportedNetworksData = GetSwapSupportedNetworksQueryFnData;

export const getSwapSupportedNetworksQueryKey = (
    options: Compute<ExactPartial<GetSwapSupportedNetworksOptions>> = {},
): GetSwapSupportedNetworksQueryKey => {
    return ['swapSupportedNetworks', filterQueryOptions(options)] as const;
};

export type GetSwapSupportedNetworksQueryKey = readonly [
    'swapSupportedNetworks',
    Compute<ExactPartial<GetSwapSupportedNetworksOptions>>,
];

export type GetSwapSupportedNetworksQueryOptions<selectData = GetSwapSupportedNetworksData> = QueryOptions<
    GetSwapSupportedNetworksQueryFnData,
    GetSwapSupportedNetworksErrorType,
    selectData,
    GetSwapSupportedNetworksQueryKey
>;
