/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect, useMemo } from 'react';
import { isValidAddress, hasSignMessageSupport } from '@ton/walletkit';
import type { Jetton, Wallet, GaslessSupportedAsset, SendTransactionResponse } from '@ton/walletkit';
import { useGasless } from '@demo/wallet-core';

import { useJettonInfo } from '@/hooks/useJettonInfo';
import { formatUnits, parseUnits } from '@/utils/units';

const QUOTE_DEBOUNCE_MS = 400;

interface UseGaslessJettonSendParams {
    wallet: Wallet | null | undefined;
    /** The jetton being sent, or `undefined` when TON is selected. */
    jetton: Jetton | undefined;
    recipient: string;
    amount: string;
}

export interface UseGaslessJettonSendResult {
    /** Gasless is offered for the current selection (jetton + SignMessage wallet). */
    canUse: boolean;
    /** Gasless is enabled AND offered — the path the send actually takes. */
    effective: boolean;
    enabled: boolean;
    setEnabled: (enabled: boolean) => void;
    feeAsset: string | null;
    setFeeAsset: (address: string) => void;
    supportedAssets: GaslessSupportedAsset[];
    /** Formatted relayer commission (e.g. "0.21 USDT"), or null while quoting / unset. */
    feeFormatted: string | null;
    isQuoting: boolean;
    isSending: boolean;
    /** A fresh quote is in hand (gates the Send button). */
    hasQuote: boolean;
    error: string | null;
    send: () => Promise<SendTransactionResponse>;
}

/**
 * Encapsulates the gasless jetton-send flow for the Send page: availability,
 * relayer config + fee-asset selection, reactive (debounced) quoting and the
 * send. Keeps `SendTransaction` thin.
 */
export const useGaslessJettonSend = ({
    wallet,
    jetton,
    recipient,
    amount,
}: UseGaslessJettonSendParams): UseGaslessJettonSendResult => {
    const gasless = useGasless();

    const hasSignMessage = useMemo(() => {
        const features = wallet?.getSupportedFeatures();
        return features ? hasSignMessageSupport(features) : false;
    }, [wallet]);

    const canUse = Boolean(jetton) && hasSignMessage;
    const effective = gasless.enabled && canUse;

    const feeAssetInfo = useJettonInfo(gasless.feeAsset ?? undefined);
    const feeFormatted =
        gasless.currentQuote && feeAssetInfo?.decimals != null
            ? `${formatUnits(gasless.currentQuote.fee, feeAssetInfo.decimals)} ${feeAssetInfo.symbol ?? ''}`.trim()
            : null;

    // Resolve the relayer config (fee assets + relay address) once gasless is on
    // — single load point so the selector is populated before the first quote.
    useEffect(() => {
        if (effective) gasless.loadGaslessConfig();
    }, [effective, gasless.loadGaslessConfig]);

    // Reset gasless state when leaving the page.
    useEffect(() => {
        return () => gasless.clearGasless();
    }, [gasless.clearGasless]);

    // Re-quote (debounced) as the inputs change. The prior quote is invalidated
    // synchronously first, so a stale quote can't be sent during the debounce
    // window (the Send button gates on `hasQuote`).
    useEffect(() => {
        if (!effective) return;
        gasless.clearGaslessQuote();

        const inputAmount = parseFloat(amount);
        const decimals = jetton?.decimalsNumber;
        if (
            !jetton ||
            !recipient ||
            !isValidAddress(recipient) ||
            !(inputAmount > 0) ||
            !gasless.feeAsset ||
            !decimals
        ) {
            return;
        }

        const transferAmount = parseUnits(amount, decimals).toString();
        const jettonAddress = jetton.address;
        const id = setTimeout(() => {
            gasless.getGaslessQuote({ recipientAddress: recipient, jettonAddress, transferAmount });
        }, QUOTE_DEBOUNCE_MS);
        return () => clearTimeout(id);
    }, [effective, recipient, amount, gasless.feeAsset, jetton, gasless.clearGaslessQuote, gasless.getGaslessQuote]);

    return {
        canUse,
        effective,
        enabled: gasless.enabled,
        setEnabled: gasless.setGaslessEnabled,
        feeAsset: gasless.feeAsset,
        setFeeAsset: gasless.setGaslessFeeAsset,
        supportedAssets: gasless.supportedAssets,
        feeFormatted,
        isQuoting: gasless.isLoadingQuote,
        isSending: gasless.isSending,
        hasQuote: Boolean(gasless.currentQuote),
        error: gasless.error,
        send: gasless.sendGasless,
    };
};
