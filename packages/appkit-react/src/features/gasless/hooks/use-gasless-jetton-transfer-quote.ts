/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use client';

import { getGaslessJettonTransferQuoteQueryOptions } from '@ton/appkit/queries';
import type {
    GetGaslessJettonTransferQuoteData,
    GetGaslessJettonTransferQuoteErrorType,
    GetGaslessJettonTransferQuoteQueryConfig,
} from '@ton/appkit/queries';

import { useAppKit } from '../../settings';
import { useQuery } from '../../../libs/query';
import type { UseQueryReturnType } from '../../../libs/query';
import { useNetwork } from '../../network';

export type UseGaslessJettonTransferQuoteParameters<selectData = GetGaslessJettonTransferQuoteData> =
    GetGaslessJettonTransferQuoteQueryConfig<selectData>;

export type UseGaslessJettonTransferQuoteReturnType<selectData = GetGaslessJettonTransferQuoteData> =
    UseQueryReturnType<selectData, GetGaslessJettonTransferQuoteErrorType>;

/**
 * Hook to fetch a gasless quote for a jetton transfer.
 *
 * Assembles the transfer messages from semantic params (no manual payload
 * building) and quotes them. Auto-refetches as inputs change.
 *
 * `useNetwork` subscribes the hook to the selected wallet, so switching wallet
 * (or network) re-renders and recomputes the wallet-bound query key, refetching
 * for the new wallet instead of serving the previous one's cached quote.
 */
export const useGaslessJettonTransferQuote = <selectData = GetGaslessJettonTransferQuoteData>(
    parameters: UseGaslessJettonTransferQuoteParameters<selectData> = {},
): UseGaslessJettonTransferQuoteReturnType<selectData> => {
    const appKit = useAppKit();
    const walletNetwork = useNetwork();

    return useQuery(
        getGaslessJettonTransferQuoteQueryOptions(appKit, {
            ...parameters,
            network: parameters.network ?? walletNetwork,
        }),
    );
};
