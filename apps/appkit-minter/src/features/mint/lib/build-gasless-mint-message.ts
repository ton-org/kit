/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Address, beginCell, Cell } from '@ton/core';
import { asBase64 } from '@ton/appkit';
import type { Base64String, TransactionRequestMessage, UserFriendlyAddress } from '@ton/appkit';

import type { CardData } from '../types/card';
import { FORWARD_TON_AMOUNT, JETTON_GAS_BUDGET, JETTON_TRANSFER_OP, USDT_FORWARD_JETTON_AMOUNT } from '../constants';
import { buildMintMessageData } from './build-mint-message-data';

export interface BuildGaslessMintMessageParams {
    card: CardData;
    walletAddress: UserFriendlyAddress;
    feeAssetWalletAddress: UserFriendlyAddress;
    relayAddress: UserFriendlyAddress;
    forwardAddress: UserFriendlyAddress;
}

/**
 * Pure builder for the gasless mint message. Wraps the NFT deploy spec into
 * a TEP-74 jetton-transfer's `forward_payload` addressed to the on-chain
 * forwarder contract. `response_destination = relayer` mirrors the standard
 * gasless pattern — relayer paid compute, captures the jetton-wallet's GRAM
 * excess.
 */
export const buildGaslessMintMessage = (params: BuildGaslessMintMessageParams): TransactionRequestMessage => {
    const { card, walletAddress, feeAssetWalletAddress, relayAddress, forwardAddress } = params;

    const nftData = buildMintMessageData({ card, ownerAddress: walletAddress });
    const nftAddress = Address.parse(nftData.address);
    const nftStateInit = Cell.fromBase64(nftData.stateInit);
    const nftAmount = BigInt(nftData.amount);

    // forward_payload per MintForward.tolk:
    //   address(toAddress), ref(body), ref(stateInit), coins(amount)
    const forwardPayload = beginCell()
        .storeAddress(nftAddress)
        .storeRef(beginCell().endCell())
        .storeRef(nftStateInit)
        .storeCoins(nftAmount)
        .endCell();

    const transferBody = beginCell()
        .storeUint(JETTON_TRANSFER_OP, 32)
        .storeUint(0, 64) // query_id
        .storeCoins(USDT_FORWARD_JETTON_AMOUNT)
        .storeAddress(Address.parse(forwardAddress))
        .storeAddress(Address.parse(relayAddress))
        .storeBit(0) // custom_payload: none
        .storeCoins(FORWARD_TON_AMOUNT)
        .storeBit(1) // forward_payload: ref
        .storeRef(forwardPayload)
        .endCell();

    return {
        address: feeAssetWalletAddress,
        amount: JETTON_GAS_BUDGET.toString(),
        payload: asBase64(transferBody.toBoc().toString('base64')) as Base64String,
    };
};
