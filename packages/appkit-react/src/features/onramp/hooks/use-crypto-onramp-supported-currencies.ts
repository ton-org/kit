/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use client';

import { getCryptoOnrampSupportedCurrenciesQueryOptions } from '@ton/appkit/queries';
import type {
    GetCryptoOnrampSupportedCurrenciesData,
    GetCryptoOnrampSupportedCurrenciesErrorType,
    GetCryptoOnrampSupportedCurrenciesQueryConfig,
} from '@ton/appkit/queries';

import { useAppKit } from '../../settings';
import { useQuery } from '../../../libs/query';
import type { UseQueryReturnType } from '../../../libs/query';

export type UseCryptoOnrampSupportedCurrenciesParameters<selectData = GetCryptoOnrampSupportedCurrenciesData> =
    GetCryptoOnrampSupportedCurrenciesQueryConfig<selectData>;

export type UseCryptoOnrampSupportedCurrenciesReturnType<selectData = GetCryptoOnrampSupportedCurrenciesData> =
    UseQueryReturnType<selectData, GetCryptoOnrampSupportedCurrenciesErrorType>;

/**
 * Hook to discover supported source/destination currencies for the current
 * crypto-onramp provider.
 */
export const useCryptoOnrampSupportedCurrencies = <selectData = GetCryptoOnrampSupportedCurrenciesData>(
    parameters: UseCryptoOnrampSupportedCurrenciesParameters<selectData> = {},
): UseCryptoOnrampSupportedCurrenciesReturnType<selectData> => {
    const appKit = useAppKit();

    return useQuery(getCryptoOnrampSupportedCurrenciesQueryOptions(appKit, parameters));
};
