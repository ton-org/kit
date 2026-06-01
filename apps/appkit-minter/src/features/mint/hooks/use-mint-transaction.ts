/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useCallback } from 'react';
import { Address, beginCell, storeStateInit, toNano } from '@ton/core';
import { useSelectedWallet } from '@ton/appkit-react';
import type { Base64String, TransactionRequest } from '@ton/appkit';

import { useMinterStore } from '../store/minter-store';
import { buildSingleNftStateInit, encodeOnChainContent } from '../contracts';

export interface UseMintTransactionReturn {
    /** Builds a fresh NFT deploy `TransactionRequest`. Throws when inputs aren't ready. */
    build: () => Promise<TransactionRequest>;
    /** Current card and connected wallet are both present. */
    isReady: boolean;
}

/**
 * Builder for the regular (non-gasless) NFT deploy message. Returns an async
 * `build()` rather than pre-computed state so the request's `validUntil`
 * window starts at click-time, not at hook-mount-time.
 */
export const useMintTransaction = (): UseMintTransactionReturn => {
    const currentCard = useMinterStore((state) => state.currentCard);
    const [wallet] = useSelectedWallet();

    const isReady = !!currentCard && !!wallet;

    const build = useCallback(async (): Promise<TransactionRequest> => {
        if (!currentCard || !wallet) {
            throw new Error('Cannot build mint transaction: no current card or wallet');
        }

        const walletAddress = Address.parse(wallet.getAddress());

        const contentCell = encodeOnChainContent({
            name: currentCard.name,
            description: currentCard.description,
            image: currentCard.imageUrl,
        });

        const { stateInit, address: nftAddress } = buildSingleNftStateInit({
            ownerAddress: walletAddress,
            editorAddress: walletAddress,
            contentCell,
            royaltyParams: {
                royaltyFactor: 0,
                royaltyBase: 1000,
                royaltyAddress: walletAddress,
            },
        });

        const stateInitCell = beginCell().store(storeStateInit(stateInit)).endCell();

        return {
            validUntil: Math.floor(Date.now() / 1000) + 600,
            messages: [
                {
                    address: nftAddress.toString(),
                    amount: toNano('0.001').toString(),
                    stateInit: stateInitCell.toBoc().toString('base64') as Base64String,
                },
            ],
        };
    }, [currentCard, wallet]);

    return { build, isReady };
};
