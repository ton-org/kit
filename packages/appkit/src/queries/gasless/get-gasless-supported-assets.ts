/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { getGaslessSupportedAssets } from '../../actions/gasless/get-gasless-supported-assets';
import type {
    GetGaslessSupportedAssetsErrorType,
    GetGaslessSupportedAssetsOptions,
    GetGaslessSupportedAssetsReturnType,
} from '../../actions/gasless/get-gasless-supported-assets';
import type { AppKit } from '../../core/app-kit';
import type { QueryOptions, QueryParameter } from '../../types/query';
import type { Compute, ExactPartial } from '../../types/utils';
import { filterQueryOptions } from '../../utils';

export type { GetGaslessSupportedAssetsErrorType };

export type GetGaslessSupportedAssetsQueryConfig<selectData = GetGaslessSupportedAssetsData> = Compute<
    ExactPartial<GetGaslessSupportedAssetsOptions>
> &
    QueryParameter<
        GetGaslessSupportedAssetsQueryFnData,
        GetGaslessSupportedAssetsErrorType,
        selectData,
        GetGaslessSupportedAssetsQueryKey
    >;

export const getGaslessSupportedAssetsQueryOptions = <selectData = GetGaslessSupportedAssetsData>(
    appKit: AppKit,
    options: GetGaslessSupportedAssetsQueryConfig<selectData> = {},
): GetGaslessSupportedAssetsQueryOptions<selectData> => {
    return {
        ...options.query,
        queryFn: async (context) => {
            const [, parameters] = context.queryKey as [string, GetGaslessSupportedAssetsOptions];
            return getGaslessSupportedAssets(appKit, parameters);
        },
        queryKey: getGaslessSupportedAssetsQueryKey(options),
    };
};

export type GetGaslessSupportedAssetsQueryFnData = Compute<Awaited<GetGaslessSupportedAssetsReturnType>>;

export type GetGaslessSupportedAssetsData = GetGaslessSupportedAssetsQueryFnData;

export const getGaslessSupportedAssetsQueryKey = (
    options: Compute<ExactPartial<GetGaslessSupportedAssetsOptions>> = {},
): GetGaslessSupportedAssetsQueryKey => {
    return ['gaslessSupportedAssets', filterQueryOptions(options as unknown as Record<string, unknown>)] as const;
};

export type GetGaslessSupportedAssetsQueryKey = readonly [
    'gaslessSupportedAssets',
    Compute<ExactPartial<GetGaslessSupportedAssetsOptions>>,
];

export type GetGaslessSupportedAssetsQueryOptions<selectData = GetGaslessSupportedAssetsData> = QueryOptions<
    GetGaslessSupportedAssetsQueryFnData,
    GetGaslessSupportedAssetsErrorType,
    selectData,
    GetGaslessSupportedAssetsQueryKey
>;
