/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect, useState } from 'react';
import { Address, beginCell, Cell } from '@ton/core';
import { useGaslessConfig, useJettonWalletAddress, useSelectedWallet } from '@ton/appkit-react';
import { asBase64 } from '@ton/appkit';
import type { Base64String, TransactionRequestMessage } from '@ton/appkit';

import { useMinterStore } from '../store/minter-store';
import {
    FORWARD_TON_AMOUNT,
    JETTON_GAS_BUDGET,
    JETTON_TRANSFER_OP,
    MINT_FORWARD_ADDRESS,
    USDT_FORWARD_JETTON_AMOUNT,
} from '../constants';
import { useMintTransaction } from './use-mint-transaction';

export interface UseGaslessMintMessageReturn {
    /** TEP-74 jetton-transfer message ready for the TonAPI gasless quote, or `undefined` while inputs are unresolved. */
    message: TransactionRequestMessage | undefined;
    /** `message` is non-undefined — all inputs are resolved. */
    isReady: boolean;
}

/**
 * Builder for the gasless mint message. Wraps the NFT deploy spec (address,
 * body, stateInit, amount) into a TEP-74 jetton-transfer's `forward_payload`
 * addressed to the on-chain forwarder contract — so the relayer's user-signed
 * batch contains only a plain jetton transfer and never sees a top-level
 * `stateInit`.
 *
 * Dormant until card + wallet + relayer config + fee-asset are all resolved;
 * `message` stays `undefined` to keep consumers (e.g. `useGaslessQuote`)
 * cleanly gated.
 */
export const useGaslessMintMessage = (): UseGaslessMintMessageReturn => {
    const [wallet] = useSelectedWallet();
    const gaslessFeeAsset = useMinterStore((state) => state.gaslessFeeAsset);
    const { build, isReady: isMintReady } = useMintTransaction();

    const { data: gaslessConfig } = useGaslessConfig();
    const relayAddress = gaslessConfig?.relayAddress;

    const { data: feeAssetWalletAddress } = useJettonWalletAddress({
        jettonAddress: gaslessFeeAsset ?? undefined,
        ownerAddress: wallet?.getAddress() ?? undefined,
        query: { enabled: !!gaslessFeeAsset && !!wallet },
    });

    const [message, setMessage] = useState<TransactionRequestMessage | undefined>(undefined);

    useEffect(() => {
        if (!isMintReady || !wallet || !feeAssetWalletAddress || !relayAddress) {
            setMessage(undefined);
            return;
        }

        let cancelled = false;
        build()
            .then((req) => {
                const nftMsg = req.messages[0];
                if (!nftMsg.stateInit) throw new Error('Mint message has no stateInit');

                const nftAddress = Address.parse(nftMsg.address);
                const nftStateInit = Cell.fromBase64(nftMsg.stateInit);
                const nftAmount = BigInt(nftMsg.amount);
                const emptyBody = beginCell().endCell();

                // forward_payload per MintForward.tolk:
                //   address(toAddress), ref(body), ref(stateInit), coins(amount)
                const forwardPayload = beginCell()
                    .storeAddress(nftAddress)
                    .storeRef(emptyBody)
                    .storeRef(nftStateInit)
                    .storeCoins(nftAmount)
                    .endCell();

                // `response_destination = relayer` mirrors the standard gasless
                // jetton-transfer pattern — relayer paid compute, captures the
                // jetton-wallet's TON excess.
                const transferBody = beginCell()
                    .storeUint(JETTON_TRANSFER_OP, 32)
                    .storeUint(0, 64) // query_id
                    .storeCoins(USDT_FORWARD_JETTON_AMOUNT)
                    .storeAddress(Address.parse(MINT_FORWARD_ADDRESS))
                    .storeAddress(Address.parse(relayAddress))
                    .storeBit(0) // custom_payload: none
                    .storeCoins(FORWARD_TON_AMOUNT)
                    .storeBit(1) // forward_payload: ref
                    .storeRef(forwardPayload)
                    .endCell();

                if (cancelled) return;
                setMessage({
                    address: feeAssetWalletAddress,
                    amount: JETTON_GAS_BUDGET.toString(),
                    payload: asBase64(transferBody.toBoc().toString('base64')) as Base64String,
                });
            })
            .catch(() => {
                if (cancelled) return;
                // Build failures keep `message` undefined; consumers stay gated
                // until the failing input becomes valid again.
                setMessage(undefined);
            });

        return () => {
            cancelled = true;
        };
    }, [build, feeAssetWalletAddress, isMintReady, relayAddress, wallet]);

    return { message, isReady: !!message };
};
