/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { getStakingSupportedNetworksQueryOptions } from '@ton/appkit/queries';
import type {
    GetStakingSupportedNetworksData,
    GetStakingSupportedNetworksErrorType,
    GetStakingSupportedNetworksQueryConfig,
} from '@ton/appkit/queries';

import { useAppKit } from '../../settings';
import { useQuery } from '../../../libs/query';
import type { UseQueryReturnType } from '../../../libs/query';
import { useStakingProvider } from './use-staking-provider';

export type UseStakingSupportedNetworksParameters<selectData = GetStakingSupportedNetworksData> =
    GetStakingSupportedNetworksQueryConfig<selectData>;
export type UseStakingSupportedNetworksReturnType<selectData = GetStakingSupportedNetworksData> = UseQueryReturnType<
    selectData,
    GetStakingSupportedNetworksErrorType
>;

/**
 * Hook to get networks supported by a staking provider
 */
export const useStakingSupportedNetworks = <selectData = GetStakingSupportedNetworksData>(
    parameters: UseStakingSupportedNetworksParameters<selectData> = {},
): UseStakingSupportedNetworksReturnType<selectData> => {
    const appKit = useAppKit();
    const provider = useStakingProvider({ id: parameters.providerId });

    return useQuery(
        getStakingSupportedNetworksQueryOptions(appKit, {
            providerId: provider?.providerId,
            ...parameters,
        }),
    );
};
