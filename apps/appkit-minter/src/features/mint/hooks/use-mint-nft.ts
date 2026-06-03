/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useMutation } from '@tanstack/react-query';
import { useGaslessQuote, useSendGaslessTransaction, useSendTransaction } from '@ton/appkit-react';
import type { GaslessQuote } from '@ton/appkit';

import { useMinterStore } from '../store/minter-store';
import { useGaslessMintFee } from './use-gasless-mint-fee';
import { useGaslessMintMessage } from './use-gasless-mint-message';
import { useMintTransaction } from './use-mint-transaction';

export interface UseMintNftReturn {
    /** Trigger the mint — picks the right flow based on `gaslessEnabled` in store. */
    send: () => Promise<void>;
    /** Send mutation is in flight. */
    isSending: boolean;
    /** Latest send error. */
    error: Error | undefined;
    /** Inputs are resolved and (when gasless) a fresh quote is in hand. */
    canSend: boolean;

    gasless: {
        /** Derived from the store flag — convenience for UI gating. */
        enabled: boolean;
        /** Latest gasless quote; `undefined` while quoting or before inputs are ready. */
        quote: GaslessQuote | undefined;
        /** Quote refetch in progress. */
        isLoadingQuote: boolean;
        /** Formatted relayer commission, e.g. `"0.219 USDT"`. */
        fee: string | undefined;
        /** Quote-side error — kept distinct from send-side error for UI nuance. */
        quoteError: Error | undefined;
    };
}

/**
 * Single entry-point for the mint flow. Reads `gaslessEnabled` and
 * `gaslessFeeAsset` from `minter-store` and dispatches to either:
 *
 * - **Gasless**: builds the jetton-transfer wrapper via {@link useGaslessMintMessage},
 *   quotes it via {@link useGaslessQuote}, sends through TonAPI via {@link useSendGaslessTransaction}.
 * - **Regular**: emits the raw NFT deploy via {@link useSendTransaction}, building
 *   the request lazily at click-time via {@link useMintTransaction}.
 *
 * The `send` action is itself a `useMutation` so its state is tracked
 * end-to-end (covering both the inner build and the inner send call).
 */
export const useMintNft = (): UseMintNftReturn => {
    const gaslessEnabled = useMinterStore((state) => state.gaslessEnabled);
    const gaslessFeeAsset = useMinterStore((state) => state.gaslessFeeAsset);

    const { build: buildMintTransaction, isReady: isMintReady } = useMintTransaction();

    // Gasless path
    const { data: message } = useGaslessMintMessage();
    const {
        data: quote,
        isFetching: isLoadingQuote,
        error: quoteError,
    } = useGaslessQuote({
        messages: message ? [message] : [],
        feeAsset: gaslessFeeAsset ?? undefined,
        query: { enabled: gaslessEnabled && !!message },
    });

    const fee = useGaslessMintFee(quote, gaslessFeeAsset);

    const { mutateAsync: sendGasless } = useSendGaslessTransaction();
    const { mutateAsync: sendRegular } = useSendTransaction();

    const sendMutation = useMutation({
        mutationFn: async (): Promise<void> => {
            if (gaslessEnabled) {
                if (!quote) throw new Error('Gasless quote not ready');
                await sendGasless({ quote });
                return;
            }
            const request = await buildMintTransaction();
            await sendRegular(request);
        },
    });

    const canSend =
        isMintReady && !sendMutation.isPending && (!gaslessEnabled || (!!quote && !isLoadingQuote && !quoteError));

    return {
        send: sendMutation.mutateAsync,
        isSending: sendMutation.isPending,
        error: sendMutation.error ?? undefined,
        canSend,
        gasless: {
            enabled: gaslessEnabled,
            quote: quote ?? undefined,
            isLoadingQuote,
            fee,
            quoteError: quoteError ?? undefined,
        },
    };
};
