/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { useAddress, useGaslessConfig, useJettonWalletAddress, useNetwork } from '@ton/appkit-react';
import type { TransactionRequestMessage } from '@ton/appkit';

import { useMinterStore } from '../store/minter-store';
import { getMintForwardAddress } from '../constants';
import { buildGaslessMintMessage } from '../lib/build-gasless-mint-message';

export type UseGaslessMintMessageReturn = UseQueryResult<TransactionRequestMessage>;

/**
 * Wraps the NFT deploy spec into a TEP-74 jetton-transfer addressed to the
 * on-chain forwarder, so the relayer's user-signed batch contains only a
 * plain jetton transfer and never sees a top-level `stateInit`.
 *
 * Returns the raw `useQuery` result — consumers read `data` / `isFetching` /
 * `error` directly, same as other React Query hooks in the SDK.
 */
export const useGaslessMintMessage = (): UseGaslessMintMessageReturn => {
    const network = useNetwork();
    const walletAddress = useAddress();

    const currentCard = useMinterStore((state) => state.currentCard);
    const gaslessFeeAsset = useMinterStore((state) => state.gaslessFeeAsset);

    const { data: gaslessConfig } = useGaslessConfig();
    const relayAddress = gaslessConfig?.relayAddress;
    const forwardAddress = network ? getMintForwardAddress(network.chainId) : undefined;

    const { data: feeAssetWalletAddress } = useJettonWalletAddress({
        jettonAddress: gaslessFeeAsset ?? undefined,
        ownerAddress: walletAddress,
        query: { enabled: !!gaslessFeeAsset && !!walletAddress },
    });

    return useQuery({
        queryKey: [
            'gasless-mint-message',
            currentCard?.id,
            walletAddress,
            gaslessFeeAsset,
            feeAssetWalletAddress,
            relayAddress,
            forwardAddress,
        ],
        queryFn: (): TransactionRequestMessage => {
            if (!currentCard || !walletAddress || !feeAssetWalletAddress || !relayAddress || !forwardAddress) {
                throw new Error('Gasless mint message inputs are not ready');
            }

            return buildGaslessMintMessage({
                card: currentCard,
                walletAddress,
                feeAssetWalletAddress,
                relayAddress,
                forwardAddress,
            });
        },
        enabled: !!currentCard && !!walletAddress && !!feeAssetWalletAddress && !!relayAddress && !!forwardAddress,
        // Pure derivation of inputs — no need to refetch on focus/window-resume,
        // and the outer gasless quote owns its own `validUntil` window.
        staleTime: Infinity,
    });
};
