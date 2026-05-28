/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use client';

import { getGaslessQuoteQueryOptions } from '@ton/appkit/queries';
import type { GetGaslessQuoteData, GetGaslessQuoteErrorType, GetGaslessQuoteQueryConfig } from '@ton/appkit/queries';

import { useAppKit } from '../../settings';
import { useQuery } from '../../../libs/query';
import type { UseQueryReturnType } from '../../../libs/query';
import { useNetwork } from '../../network';

export type UseGaslessQuoteParameters<selectData = GetGaslessQuoteData> = GetGaslessQuoteQueryConfig<selectData>;

export type UseGaslessQuoteReturnType<selectData = GetGaslessQuoteData> = UseQueryReturnType<
    selectData,
    GetGaslessQuoteErrorType
>;

/**
 * Hook to fetch a gasless quote. Auto-refetches as inputs change.
 *
 * The quote carries a relayer-provided `validUntil` window; cached results
 * become stale after `GASLESS_QUOTE_STALE_TIME_MS` (2 minutes).
 *
 * `useNetwork` subscribes the hook to the selected wallet, so switching wallet
 * (or network) re-renders and recomputes the query key — which is bound to the
 * wallet address — refetching a quote for the new wallet instead of reusing one
 * issued for the previous one.
 */
export const useGaslessQuote = <selectData = GetGaslessQuoteData>(
    parameters: UseGaslessQuoteParameters<selectData> = {},
): UseGaslessQuoteReturnType<selectData> => {
    const appKit = useAppKit();
    // Subscribe to the selected wallet so a wallet/network switch re-renders and
    // recomputes the wallet-bound query key (the options factory reads the
    // selected wallet), refetching for the new wallet instead of serving the
    // previous one's cached quote.
    useNetwork();

    return useQuery(getGaslessQuoteQueryOptions(appKit, parameters));
};
