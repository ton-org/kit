/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { AppKit } from '../../core/app-kit';
import { getCryptoOnrampSupportedCurrencies } from '../../actions/crypto-onramp/get-crypto-onramp-supported-currencies';
import type {
    GetCryptoOnrampSupportedCurrenciesOptions,
    GetCryptoOnrampSupportedCurrenciesReturnType,
} from '../../actions/crypto-onramp/get-crypto-onramp-supported-currencies';
import type { QueryOptions, QueryParameter } from '../../types/query';
import type { Compute, ExactPartial } from '../../types/utils';
import { filterQueryOptions } from '../../utils';

export type GetCryptoOnrampSupportedCurrenciesErrorType = Error;
export type GetCryptoOnrampSupportedCurrenciesData = GetCryptoOnrampSupportedCurrenciesQueryFnData;
export type GetCryptoOnrampSupportedCurrenciesQueryConfig<selectData = GetCryptoOnrampSupportedCurrenciesData> =
    Compute<ExactPartial<GetCryptoOnrampSupportedCurrenciesOptions>> &
        QueryParameter<
            GetCryptoOnrampSupportedCurrenciesQueryFnData,
            GetCryptoOnrampSupportedCurrenciesErrorType,
            selectData,
            GetCryptoOnrampSupportedCurrenciesQueryKey
        >;

const ONE_HOUR_MS = 60 * 60 * 1000;
const ONE_DAY_MS = 24 * ONE_HOUR_MS;

export const getCryptoOnrampSupportedCurrenciesQueryOptions = <selectData = GetCryptoOnrampSupportedCurrenciesData>(
    appKit: AppKit,
    options: GetCryptoOnrampSupportedCurrenciesQueryConfig<selectData> = {},
): GetCryptoOnrampSupportedCurrenciesQueryOptions<selectData> => {
    return {
        // The supported-currencies list for a provider rarely changes. Keep the fetched data
        // in-cache long enough that the widget never refetches it within a normal session.
        // Consumers can override via `options.query` if they need different behavior.
        staleTime: ONE_HOUR_MS,
        gcTime: ONE_DAY_MS,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        ...options.query,
        queryFn: async (context) => {
            const [, parameters] = context.queryKey as [string, GetCryptoOnrampSupportedCurrenciesOptions];
            return getCryptoOnrampSupportedCurrencies(appKit, parameters);
        },
        queryKey: getCryptoOnrampSupportedCurrenciesQueryKey(options),
    };
};

export type GetCryptoOnrampSupportedCurrenciesQueryFnData = Compute<
    Awaited<GetCryptoOnrampSupportedCurrenciesReturnType>
>;
export const getCryptoOnrampSupportedCurrenciesQueryKey = (
    options: Compute<ExactPartial<GetCryptoOnrampSupportedCurrenciesOptions>> = {},
): GetCryptoOnrampSupportedCurrenciesQueryKey =>
    ['crypto-onramp-supported-currencies', filterQueryOptions(options)] as const;
export type GetCryptoOnrampSupportedCurrenciesQueryKey = readonly [
    'crypto-onramp-supported-currencies',
    Compute<ExactPartial<GetCryptoOnrampSupportedCurrenciesOptions>>,
];
export type GetCryptoOnrampSupportedCurrenciesQueryOptions<selectData = GetCryptoOnrampSupportedCurrenciesData> =
    QueryOptions<
        GetCryptoOnrampSupportedCurrenciesQueryFnData,
        GetCryptoOnrampSupportedCurrenciesErrorType,
        selectData,
        GetCryptoOnrampSupportedCurrenciesQueryKey
    >;
