/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useMutation } from '@tanstack/react-query';
import { useSelectedWallet } from '@ton/appkit-react';
import type { TransactionRequest } from '@ton/appkit';

import { useMinterStore } from '../store/minter-store';
import { buildMintMessageData } from '../lib/build-mint-message-data';

/** TonConnect transaction validity window — relayer rejects after expiry. */
const VALID_UNTIL_SECONDS = 600;

export interface UseMintTransactionReturn {
    /** Builds a fresh NFT deploy `TransactionRequest`. Throws when inputs aren't ready. */
    build: () => Promise<TransactionRequest>;
    /** Current card and connected wallet are both present. */
    isReady: boolean;
    /** Build is in flight (negligible — build is sync; tracked for parity with other mutations). */
    isBuilding: boolean;
    /** Latest build error from the mutation. */
    buildError: Error | undefined;
}

/**
 * Builder for the regular (non-gasless) NFT deploy `TransactionRequest`.
 * Wraps the build in a `useMutation` so the request is constructed lazily at
 * `build()`-time — `validUntil` is computed from `Date.now()` and would be
 * stale if pre-computed at mount.
 */
export const useMintTransaction = (): UseMintTransactionReturn => {
    const currentCard = useMinterStore((state) => state.currentCard);
    const [wallet] = useSelectedWallet();

    const isReady = !!currentCard && !!wallet;

    const mutation = useMutation<TransactionRequest>({
        mutationFn: async () => {
            if (!currentCard || !wallet) {
                throw new Error('Cannot build mint transaction: no current card or wallet');
            }

            const data = buildMintMessageData({ card: currentCard, ownerAddress: wallet.getAddress() });

            return {
                validUntil: Math.floor(Date.now() / 1000) + VALID_UNTIL_SECONDS,
                messages: [data],
            };
        },
    });

    return {
        build: mutation.mutateAsync,
        isReady,
        isBuilding: mutation.isPending,
        buildError: mutation.error ?? undefined,
    };
};
