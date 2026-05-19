/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { getStakingProviderMetadataQueryOptions } from '@ton/appkit/queries';
import type {
    GetStakingProviderMetadataData,
    GetStakingProviderMetadataErrorType,
    GetStakingProviderMetadataQueryConfig,
} from '@ton/appkit/queries';

import { useAppKit } from '../../settings';
import { useQuery } from '../../../libs/query';
import type { UseQueryReturnType } from '../../../libs/query';
import { useNetwork } from '../../network';
import { useStakingProvider } from './use-staking-provider';

export type UseStakingProviderMetadataParameters<selectData = GetStakingProviderMetadataData> =
    GetStakingProviderMetadataQueryConfig<selectData>;
export type UseStakingProviderMetadataReturnType<selectData = GetStakingProviderMetadataData> = UseQueryReturnType<
    selectData,
    GetStakingProviderMetadataErrorType
>;

/**
 * Hook to get static staking provider metadata
 */
export const useStakingProviderMetadata = <selectData = GetStakingProviderMetadataData>(
    parameters: UseStakingProviderMetadataParameters<selectData> = {},
): UseStakingProviderMetadataReturnType<selectData> => {
    const appKit = useAppKit();
    const walletNetwork = useNetwork();
    const provider = useStakingProvider({ id: parameters.providerId });

    return useQuery(
        getStakingProviderMetadataQueryOptions(appKit, {
            providerId: provider?.providerId,
            ...parameters,
            network: parameters.network ?? walletNetwork,
        }),
    );
};
