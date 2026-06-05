/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useCallback, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toNano } from '@ton/core';
import {
    useBalance,
    useGaslessConfig,
    useGaslessQuote,
    useSendGaslessTransaction,
    useSendTransaction,
} from '@ton/appkit-react';
import { checkTonBalance, formatUnits } from '@ton/appkit';
import type { GaslessQuote } from '@ton/appkit';

import { useMinterStore } from '../store/minter-store';
import { setGaslessEnabled } from '../store/actions/set-gasless-enabled';
import { seedGaslessFeeAsset } from '../store/actions/seed-gasless-fee-asset';
import { useCanEnableGasless } from './use-can-enable-gasless';
import { useGaslessMintFee } from './use-gasless-mint-fee';
import { useGaslessMintMessage } from './use-gasless-mint-message';
import { useMintTransaction } from './use-mint-transaction';

/** TON buffer beyond the deploy amount when checking shortfall for the regular flow. */
const REGULAR_MINT_GAS_BUFFER = toNano('0.01');

export type MintShortfall = { mode: 'gasless' | 'topup'; requiredTon: string };

export interface UseMintNftReturn {
    /** Trigger the mint — picks the right flow based on `gaslessEnabled` in store. */
    send: () => Promise<void>;
    /** Send mutation is in flight. */
    isSending: boolean;
    /** Latest send error. */
    error: Error | undefined;
    /** Inputs are resolved and (when gasless) a fresh quote is in hand. */
    canSend: boolean;
    /**
     * Run a pre-flight shortfall check. Returns `undefined` when the user can proceed
     * (or when the gasless flow is active — the relayer fronts gas there). Otherwise
     * returns a `MintShortfall` describing which path to suggest:
     * - `'gasless'` if the user could switch flows to bypass the TON requirement.
     * - `'topup'` if gasless isn't available — the user must add TON.
     */
    checkShortfall: () => MintShortfall | undefined;

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
 * The `send` action focuses on the send itself — pre-flight balance check is
 * exposed separately as {@link UseMintNftReturn.checkShortfall} so the UI can
 * intercept and offer alternatives (e.g. switch to gasless) before signing.
 */
export const useMintNft = (): UseMintNftReturn => {
    const gaslessEnabled = useMinterStore((state) => state.gaslessEnabled);
    const gaslessFeeAsset = useMinterStore((state) => state.gaslessFeeAsset);

    const { messages, build: buildMintTransaction, isReady: isMintReady } = useMintTransaction();
    const canEnableGasless = useCanEnableGasless();
    const { data: tonBalance } = useBalance();
    const { data: gaslessConfig } = useGaslessConfig({ query: { enabled: gaslessEnabled } });

    // Gasless path
    const { data: message } = useGaslessMintMessage();
    const {
        data: quote,
        isFetching: isLoadingQuote,
        error: quoteError,
        queryKey: gaslessQuoteKey,
    } = useGaslessQuote({
        messages: message ? [message] : [],
        feeAsset: gaslessFeeAsset ?? undefined,
        query: { enabled: gaslessEnabled && !!message },
    });

    const fee = useGaslessMintFee(quote, gaslessFeeAsset);

    const { mutateAsync: sendGasless } = useSendGaslessTransaction();
    const { mutateAsync: sendRegular } = useSendTransaction();

    const queryClient = useQueryClient();

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
        onError: () => {
            // On a failed gasless send, drop the cached quote so a retry refetches a
            // fresh one (new `validUntil`) instead of re-submitting the same — e.g.
            // after a quote-expiry or relayer error. This doesn't touch the on-chain
            // seqno guard (the send still re-signs at click-time); it just refreshes
            // the relayer estimate the confirm modal shows and the next send uses.
            if (gaslessEnabled) {
                void queryClient.invalidateQueries({ queryKey: gaslessQuoteKey });
            }
        },
    });

    const checkShortfall = useCallback((): MintShortfall | undefined => {
        // Gasless flow: relayer fronts gas — no pre-flight check needed.
        if (gaslessEnabled) return undefined;
        if (!messages) return undefined;

        const shortfall = checkTonBalance({
            messages,
            tonBalance,
            gasBufferNanos: REGULAR_MINT_GAS_BUFFER,
        });

        if (!shortfall) return undefined;

        return {
            mode: canEnableGasless ? 'gasless' : 'topup',
            requiredTon: formatUnits(shortfall.requiredNanos, 9),
        };
    }, [gaslessEnabled, messages, tonBalance, canEnableGasless]);

    // Reconcile the persisted `gaslessEnabled` flag with current availability:
    // switching to a wallet/network that can't do gasless (no `SignMessage`, no
    // deployed forwarder) must drop the flag — otherwise the settings switch
    // stays disabled-on and the gasless send path waits forever on a quote that
    // can never be produced.
    useEffect(() => {
        if (gaslessEnabled && !canEnableGasless) setGaslessEnabled(false);
    }, [gaslessEnabled, canEnableGasless]);

    // Seed the fee asset once the relayer config resolves. Enabling gasless only
    // flips the flag; seeding here (rather than at the enable call site) means the
    // USDT default is applied even if the config hadn't loaded when gasless was
    // turned on — otherwise the confirm modal would open on an empty "Select" and
    // the quote (hence Confirm) would stay blocked until a manual pick.
    useEffect(() => {
        if (gaslessEnabled && !gaslessFeeAsset && gaslessConfig?.supportedAssets?.length) {
            seedGaslessFeeAsset(gaslessConfig.supportedAssets);
        }
    }, [gaslessEnabled, gaslessFeeAsset, gaslessConfig]);

    const canSend =
        isMintReady && !sendMutation.isPending && (!gaslessEnabled || (!!quote && !isLoadingQuote && !quoteError));

    return {
        send: sendMutation.mutateAsync,
        isSending: sendMutation.isPending,
        error: sendMutation.error ?? undefined,
        canSend,
        checkShortfall,
        gasless: {
            enabled: gaslessEnabled,
            quote: quote ?? undefined,
            isLoadingQuote,
            fee,
            quoteError: quoteError ?? undefined,
        },
    };
};
