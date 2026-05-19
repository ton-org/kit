/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { getSwapSupportedNetworksQueryOptions } from '@ton/appkit/queries';
import type {
    GetSwapSupportedNetworksData,
    GetSwapSupportedNetworksErrorType,
    GetSwapSupportedNetworksQueryConfig,
} from '@ton/appkit/queries';

import { useAppKit } from '../../settings';
import { useQuery } from '../../../libs/query';
import type { UseQueryReturnType } from '../../../libs/query';

export type UseSwapSupportedNetworksParameters<selectData = GetSwapSupportedNetworksData> =
    GetSwapSupportedNetworksQueryConfig<selectData>;
export type UseSwapSupportedNetworksReturnType<selectData = GetSwapSupportedNetworksData> = UseQueryReturnType<
    selectData,
    GetSwapSupportedNetworksErrorType
>;

/**
 * Hook to get networks supported by a swap provider
 */
export const useSwapSupportedNetworks = <selectData = GetSwapSupportedNetworksData>(
    parameters: UseSwapSupportedNetworksParameters<selectData> = {},
): UseSwapSupportedNetworksReturnType<selectData> => {
    const appKit = useAppKit();
    return useQuery(getSwapSupportedNetworksQueryOptions(appKit, parameters));
};
