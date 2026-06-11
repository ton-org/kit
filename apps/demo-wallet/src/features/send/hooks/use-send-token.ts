/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useCallback } from 'react';
import { toast } from 'sonner';
import type { ITonWalletKit, Jetton, SendTransactionResponse, Wallet } from '@ton/walletkit';

import { useGaslessJettonSend } from './use-gasless-jetton-send';
import type { UseGaslessJettonSendResult } from './use-gasless-jetton-send';

import { parseUnits } from '@/core/utils/units';

const GRAM_DECIMALS = 9;

interface UseSendTokenParams {
    wallet: Wallet | null | undefined;
    walletKit: ITonWalletKit | null;
    tokenType: 'TON' | 'JETTON';
    /** Selected jetton when `tokenType === 'JETTON'`. */
    jetton: Jetton | undefined;
    recipient: string;
    amount: string;
}

export interface UseSendTokenResult {
    /**
     * Send the transfer, dispatching to the gasless or the regular flow. Returns
     * the gasless relayer response (with `normalizedHash`) for the gasless flow,
     * or `undefined` for the regular flow (which goes through the preview queue).
     */
    send: () => Promise<SendTransactionResponse | undefined>;
    /** Inputs aren't ready (no wallet/recipient/amount, or gasless quote pending). */
    isDisabled: boolean;
    /** Gasless sub-state for the UI (toggle, fee-asset selector, fee, errors). */
    gasless: UseGaslessJettonSendResult;
}

/**
 * Single entry point for the Send page, mirroring appkit-minter's `useMintNft`:
 * `send()` builds and submits the transfer, picking the gasless flow when it's
 * effective and falling back to the regular TON / jetton transfer otherwise.
 * Balance validation stays in the page (gating mirrors the mint flow).
 */
export const useSendToken = ({
    wallet,
    walletKit,
    tokenType,
    jetton,
    recipient,
    amount,
}: UseSendTokenParams): UseSendTokenResult => {
    const gasless = useGaslessJettonSend({
        wallet,
        jetton: tokenType === 'JETTON' ? jetton : undefined,
        recipient,
        amount,
    });

    const send = useCallback(async (): Promise<SendTransactionResponse | undefined> => {
        if (!wallet) throw new Error('No wallet available');

        // The regular flow routes the built tx through the kit's transaction queue;
        // without the kit it would silently no-op and the page would still report
        // success. Surface it instead of pretending the transfer went through.
        if (!walletKit) {
            toast.error('Cannot send transaction', { description: 'WalletKit is not initialized yet.' });
            throw new Error('WalletKit is not initialized');
        }

        // Gasless jetton transfer: relay the already-fetched, locally-signed quote.
        if (gasless.effective && jetton) {
            return gasless.send();
        }

        if (tokenType === 'TON') {
            const tx = await wallet.createTransferTonTransaction({
                recipientAddress: recipient,
                transferAmount: parseUnits(amount, GRAM_DECIMALS).toString(),
            });
            await walletKit.handleNewTransaction(wallet, tx);
            return undefined;
        }

        if (jetton) {
            const decimals = jetton.decimalsNumber;
            if (!decimals) throw new Error('Jetton decimals not found');

            const tx = await wallet.createTransferJettonTransaction({
                recipientAddress: recipient,
                jettonAddress: jetton.address,
                transferAmount: parseUnits(amount, decimals).toString(),
            });
            await walletKit.handleNewTransaction(wallet, tx);
        }

        return undefined;
    }, [wallet, walletKit, tokenType, jetton, recipient, amount, gasless.effective, gasless.send]);

    const isDisabled =
        !wallet ||
        !recipient ||
        !amount ||
        parseFloat(amount) <= 0 ||
        (gasless.effective && (!gasless.hasQuote || gasless.isQuoting || gasless.isSending));

    return { send, isDisabled, gasless };
};
