/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Address, beginCell, storeStateInit, toNano } from '@ton/core';
import type { Base64String } from '@ton/appkit';

import type { CardData } from '../types/card';
import { buildSingleNftStateInit, encodeOnChainContent } from '../contracts';

/** TON value sent with the NFT deploy message — funds the new contract. */
const NFT_DEPLOY_AMOUNT = toNano('0.001');
/** TEP-66 royalty config — zero royalty, owner address as receiver. */
const ROYALTY_BASE = 1000;
const ROYALTY_FACTOR = 0;

export interface MintMessageData {
    /** Future NFT contract address — deterministic from `stateInit`. */
    address: string;
    /** TON amount sent with the deploy (`NFT_DEPLOY_AMOUNT`). */
    amount: string;
    /** Serialized `StateInit` cell (BoC, base64). */
    stateInit: Base64String;
}

/**
 * Pure builder for the NFT deploy message data shared by both mint flows.
 *
 * - The regular flow (`useMintTransaction`) wraps it into a `TransactionRequest` with `validUntil`.
 * - The gasless flow (`useGaslessMintMessage`) re-packs it into a TEP-74 jetton-transfer's `forward_payload`.
 *
 * No side effects, no React, no `Date.now()` — caller controls timing.
 */
export const buildMintMessageData = (params: { card: CardData; ownerAddress: string }): MintMessageData => {
    const { card, ownerAddress } = params;
    const owner = Address.parse(ownerAddress);

    const contentCell = encodeOnChainContent({
        name: card.name,
        description: card.description,
        image: card.imageUrl,
    });

    const { stateInit, address } = buildSingleNftStateInit({
        ownerAddress: owner,
        editorAddress: owner,
        contentCell,
        royaltyParams: {
            royaltyFactor: ROYALTY_FACTOR,
            royaltyBase: ROYALTY_BASE,
            royaltyAddress: owner,
        },
    });

    const stateInitCell = beginCell().store(storeStateInit(stateInit)).endCell();

    return {
        address: address.toString(),
        amount: NFT_DEPLOY_AMOUNT.toString(),
        stateInit: stateInitCell.toBoc().toString('base64') as Base64String,
    };
};
