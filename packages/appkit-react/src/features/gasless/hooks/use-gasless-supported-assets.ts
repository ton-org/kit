/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use client';

import { getGaslessSupportedAssetsQueryOptions } from '@ton/appkit/queries';
import type {
    GetGaslessSupportedAssetsData,
    GetGaslessSupportedAssetsErrorType,
    GetGaslessSupportedAssetsQueryConfig,
} from '@ton/appkit/queries';

import { useAppKit } from '../../settings';
import { useQuery } from '../../../libs/query';
import type { UseQueryReturnType } from '../../../libs/query';

export type UseGaslessSupportedAssetsParameters<selectData = GetGaslessSupportedAssetsData> =
    GetGaslessSupportedAssetsQueryConfig<selectData>;

export type UseGaslessSupportedAssetsReturnType<selectData = GetGaslessSupportedAssetsData> = UseQueryReturnType<
    selectData,
    GetGaslessSupportedAssetsErrorType
>;

/**
 * Hook to discover the assets the gasless relayer accepts as fee payment.
 */
export const useGaslessSupportedAssets = <selectData = GetGaslessSupportedAssetsData>(
    parameters: UseGaslessSupportedAssetsParameters<selectData> = {},
): UseGaslessSupportedAssetsReturnType<selectData> => {
    const appKit = useAppKit();

    return useQuery(getGaslessSupportedAssetsQueryOptions(appKit, parameters));
};
