/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { AppKit } from '../../core/app-kit';
import { getCryptoOnrampProviderMetadata } from '../../actions/crypto-onramp/get-crypto-onramp-provider-metadata';
import type {
    GetCryptoOnrampProviderMetadataOptions,
    GetCryptoOnrampProviderMetadataReturnType,
} from '../../actions/crypto-onramp/get-crypto-onramp-provider-metadata';
import type { QueryOptions, QueryParameter } from '../../types/query';
import type { Compute, ExactPartial } from '../../types/utils';
import { filterQueryOptions } from '../../utils';

export type GetCryptoOnrampProviderMetadataErrorType = Error;
export type GetCryptoOnrampProviderMetadataData = GetCryptoOnrampProviderMetadataQueryFnData;
export type GetCryptoOnrampProviderMetadataQueryConfig<selectData = GetCryptoOnrampProviderMetadataData> = Compute<
    ExactPartial<GetCryptoOnrampProviderMetadataOptions>
> &
    QueryParameter<
        GetCryptoOnrampProviderMetadataQueryFnData,
        GetCryptoOnrampProviderMetadataErrorType,
        selectData,
        GetCryptoOnrampProviderMetadataQueryKey
    >;

export const getCryptoOnrampProviderMetadataQueryOptions = <selectData = GetCryptoOnrampProviderMetadataData>(
    appKit: AppKit,
    options: GetCryptoOnrampProviderMetadataQueryConfig<selectData> = {},
): GetCryptoOnrampProviderMetadataQueryOptions<selectData> => {
    return {
        ...options.query,
        queryFn: async (context) => {
            const [, parameters] = context.queryKey as [string, GetCryptoOnrampProviderMetadataOptions];
            return getCryptoOnrampProviderMetadata(appKit, parameters);
        },
        queryKey: getCryptoOnrampProviderMetadataQueryKey(options),
    };
};

export type GetCryptoOnrampProviderMetadataQueryFnData = Compute<Awaited<GetCryptoOnrampProviderMetadataReturnType>>;

export const getCryptoOnrampProviderMetadataQueryKey = (
    options: Compute<ExactPartial<GetCryptoOnrampProviderMetadataOptions>> = {},
): GetCryptoOnrampProviderMetadataQueryKey => ['crypto-onramp-provider-metadata', filterQueryOptions(options)] as const;

export type GetCryptoOnrampProviderMetadataQueryKey = readonly [
    'crypto-onramp-provider-metadata',
    Compute<ExactPartial<GetCryptoOnrampProviderMetadataOptions>>,
];

export type GetCryptoOnrampProviderMetadataQueryOptions<selectData = GetCryptoOnrampProviderMetadataData> =
    QueryOptions<
        GetCryptoOnrampProviderMetadataQueryFnData,
        GetCryptoOnrampProviderMetadataErrorType,
        selectData,
        GetCryptoOnrampProviderMetadataQueryKey
    >;
