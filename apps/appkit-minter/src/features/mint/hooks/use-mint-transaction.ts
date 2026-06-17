/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAddress } from '@ton/appkit-react';
import type { TransactionRequest, TransactionRequestMessage } from '@ton/appkit';

import { useMinterStore } from '../store/minter-store';
import { buildMintMessageData } from '../lib/build-mint-message-data';

/** TonConnect transaction validity window — relayer rejects after expiry. */
const VALID_UNTIL_SECONDS = 600;

export interface UseMintTransactionReturn {
    /**
     * Pre-computed deploy messages (eager). Available when card + wallet are ready.
     * Reused by downstream checks like `checkTonBalance` without invoking the build mutation.
     */
    messages: TransactionRequestMessage[] | undefined;
    /** Wraps current `messages` with a fresh `validUntil` and returns a ready-to-send `TransactionRequest`. */
    build: () => Promise<TransactionRequest>;
    /** Card + wallet are present, so `messages` is non-undefined. */
    isReady: boolean;
    /** Build mutation is in flight. */
    isBuilding: boolean;
    /** Latest build error from the mutation. */
    buildError: Error | undefined;
}

/**
 * Builder for the regular (non-gasless) NFT deploy.
 *
 * The deploy `messages` are derived eagerly from card + wallet so callers can
 * pre-check them (e.g. against the user's GRAM balance) without invoking the
 * build mutation. The mutation itself only adds a freshly stamped
 * `validUntil` at click-time.
 */
export const useMintTransaction = (): UseMintTransactionReturn => {
    const currentCard = useMinterStore((state) => state.currentCard);
    const walletAddress = useAddress();

    const messages = useMemo<TransactionRequestMessage[] | undefined>(() => {
        if (!currentCard || !walletAddress) return undefined;
        return [buildMintMessageData({ card: currentCard, ownerAddress: walletAddress })];
    }, [currentCard, walletAddress]);

    const mutation = useMutation<TransactionRequest>({
        mutationFn: async () => {
            if (!messages) {
                throw new Error('Cannot build mint transaction: no current card or wallet');
            }
            return {
                validUntil: Math.floor(Date.now() / 1000) + VALID_UNTIL_SECONDS,
                messages,
            };
        },
    });

    return {
        messages,
        build: mutation.mutateAsync,
        isReady: !!messages,
        isBuilding: mutation.isPending,
        buildError: mutation.error ?? undefined,
    };
};
