/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { getSwapProviderMetadataQueryOptions } from '@ton/appkit/queries';
import type {
    GetSwapProviderMetadataData,
    GetSwapProviderMetadataErrorType,
    GetSwapProviderMetadataQueryConfig,
} from '@ton/appkit/queries';

import { useAppKit } from '../../settings';
import { useQuery } from '../../../libs/query';
import type { UseQueryReturnType } from '../../../libs/query';

export type UseSwapProviderMetadataParameters<selectData = GetSwapProviderMetadataData> =
    GetSwapProviderMetadataQueryConfig<selectData>;
export type UseSwapProviderMetadataReturnType<selectData = GetSwapProviderMetadataData> = UseQueryReturnType<
    selectData,
    GetSwapProviderMetadataErrorType
>;

/**
 * Hook to get static swap provider metadata
 */
export const useSwapProviderMetadata = <selectData = GetSwapProviderMetadataData>(
    parameters: UseSwapProviderMetadataParameters<selectData> = {},
): UseSwapProviderMetadataReturnType<selectData> => {
    const appKit = useAppKit();
    return useQuery(getSwapProviderMetadataQueryOptions(appKit, parameters));
};
