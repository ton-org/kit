/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use client';

import { getCryptoOnrampProviderMetadataQueryOptions } from '@ton/appkit/queries';
import type {
    GetCryptoOnrampProviderMetadataData,
    GetCryptoOnrampProviderMetadataErrorType,
    GetCryptoOnrampProviderMetadataQueryConfig,
} from '@ton/appkit/queries';

import { useAppKit } from '../../settings';
import { useQuery } from '../../../libs/query';
import type { UseQueryReturnType } from '../../../libs/query';

export type UseCryptoOnrampProviderMetadataParameters<selectData = GetCryptoOnrampProviderMetadataData> =
    GetCryptoOnrampProviderMetadataQueryConfig<selectData>;

export type UseCryptoOnrampProviderMetadataReturnType<selectData = GetCryptoOnrampProviderMetadataData> =
    UseQueryReturnType<selectData, GetCryptoOnrampProviderMetadataErrorType>;

/**
 * Hook to get static metadata for a crypto-onramp provider (display name, logo, url).
 */
export const useCryptoOnrampProviderMetadata = <selectData = GetCryptoOnrampProviderMetadataData>(
    parameters: UseCryptoOnrampProviderMetadataParameters<selectData> = {},
): UseCryptoOnrampProviderMetadataReturnType<selectData> => {
    const appKit = useAppKit();
    return useQuery(getCryptoOnrampProviderMetadataQueryOptions(appKit, parameters));
};
