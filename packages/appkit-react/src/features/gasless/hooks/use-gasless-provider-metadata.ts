/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use client';

import { getGaslessProviderMetadataQueryOptions } from '@ton/appkit/queries';
import type {
    GetGaslessProviderMetadataData,
    GetGaslessProviderMetadataErrorType,
    GetGaslessProviderMetadataQueryConfig,
} from '@ton/appkit/queries';

import { useAppKit } from '../../settings';
import { useQuery } from '../../../libs/query';
import type { UseQueryReturnType } from '../../../libs/query';

export type UseGaslessProviderMetadataParameters<selectData = GetGaslessProviderMetadataData> =
    GetGaslessProviderMetadataQueryConfig<selectData>;

export type UseGaslessProviderMetadataReturnType<selectData = GetGaslessProviderMetadataData> = UseQueryReturnType<
    selectData,
    GetGaslessProviderMetadataErrorType
>;

/**
 * Hook to get static metadata for a gasless provider (display name, logo, url).
 */
export const useGaslessProviderMetadata = <selectData = GetGaslessProviderMetadataData>(
    parameters: UseGaslessProviderMetadataParameters<selectData> = {},
): UseGaslessProviderMetadataReturnType<selectData> => {
    const appKit = useAppKit();

    return useQuery(getGaslessProviderMetadataQueryOptions(appKit, parameters));
};
