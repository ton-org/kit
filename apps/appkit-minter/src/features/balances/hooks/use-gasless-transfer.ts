/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useCallback } from 'react';
import { useGaslessJettonTransferQuote, useJettonInfo, useSendGaslessTransaction } from '@ton/appkit-react';
import { formatUnits } from '@ton/appkit';
import type { GaslessSendResponse, UserFriendlyAddress } from '@ton/appkit';

interface UseGaslessTransferParams {
    /** Only quote/send while the gasless toggle is on. */
    enabled: boolean;
    jettonAddress?: string;
    recipientAddress: string;
    amount: string;
    comment?: string;
    feeAsset: UserFriendlyAddress | null;
}

/**
 * Drives the gasless quote → send flow for the transfer modal. Gasless is
 * jetton-only here: quotes the jetton transfer and exposes a formatted fee
 * plus a `send` that relays the signed quote.
 */
export const useGaslessTransfer = ({
    enabled,
    jettonAddress,
    recipientAddress,
    amount,
    comment,
    feeAsset,
}: UseGaslessTransferParams) => {
    const hasInputs = Boolean(jettonAddress && recipientAddress && amount && feeAsset);

    const {
        data: quote,
        isFetching: isQuoting,
        error: quoteError,
    } = useGaslessJettonTransferQuote({
        jettonAddress: jettonAddress ?? '',
        recipientAddress,
        amount,
        comment,
        feeAsset: feeAsset ?? undefined,
        query: { enabled: enabled && hasInputs },
    });

    const { data: feeAssetInfo } = useJettonInfo({
        address: feeAsset ?? undefined,
        query: { enabled: enabled && Boolean(feeAsset) },
    });

    const fee =
        quote && feeAssetInfo?.decimals != null
            ? `${formatUnits(quote.fee, feeAssetInfo.decimals)} ${feeAssetInfo.symbol || ''}`.trim()
            : null;

    const { mutateAsync, isPending: isSending } = useSendGaslessTransaction();

    const send = useCallback(async (): Promise<GaslessSendResponse | undefined> => {
        if (!quote) return undefined;
        return mutateAsync({ quote });
    }, [quote, mutateAsync]);

    return { quote, quoteError, isQuoting, fee, send, isSending };
};
