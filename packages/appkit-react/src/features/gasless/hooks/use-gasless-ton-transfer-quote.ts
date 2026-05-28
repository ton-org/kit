/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use client';

import { getGaslessTonTransferQuoteQueryOptions } from '@ton/appkit/queries';
import type {
    GetGaslessTonTransferQuoteData,
    GetGaslessTonTransferQuoteErrorType,
    GetGaslessTonTransferQuoteQueryConfig,
} from '@ton/appkit/queries';

import { useAppKit } from '../../settings';
import { useQuery } from '../../../libs/query';
import type { UseQueryReturnType } from '../../../libs/query';
import { useNetwork } from '../../network';

export type UseGaslessTonTransferQuoteParameters<selectData = GetGaslessTonTransferQuoteData> =
    GetGaslessTonTransferQuoteQueryConfig<selectData>;

export type UseGaslessTonTransferQuoteReturnType<selectData = GetGaslessTonTransferQuoteData> = UseQueryReturnType<
    selectData,
    GetGaslessTonTransferQuoteErrorType
>;

/**
 * Hook to fetch a gasless quote for a TON transfer.
 *
 * Assembles the transfer message from semantic params and quotes it.
 * Auto-refetches as inputs change.
 *
 * `useNetwork` subscribes the hook to the selected wallet, so switching wallet
 * (or network) re-renders and recomputes the wallet-bound query key, refetching
 * for the new wallet instead of serving the previous one's cached quote.
 */
export const useGaslessTonTransferQuote = <selectData = GetGaslessTonTransferQuoteData>(
    parameters: UseGaslessTonTransferQuoteParameters<selectData> = {},
): UseGaslessTonTransferQuoteReturnType<selectData> => {
    const appKit = useAppKit();
    useNetwork();

    return useQuery(getGaslessTonTransferQuoteQueryOptions(appKit, parameters));
};
