/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Address, beginCell, Cell } from '@ton/core';
import {
    storeNftTransferMessage,
    createCommentPayload,
    DEFAULT_NFT_GAS_FEE,
    DEFAULT_FORWARD_AMOUNT,
} from '@ton/walletkit';

import type { TransactionRequest, TransactionRequestMessage } from '../../types/transaction';
import type { Base64String } from '../../types/primitives';
import type { AppKit } from '../../core/app-kit';
import { getSelectedWallet } from '../wallets/get-selected-wallet';
import { asBase64 } from '../../utils';

export interface CreateTransferNftTransactionParameters {
    nftAddress: string;
    recipientAddress: string;
    comment?: string;
    responseDestination?: string;
    queryId?: string;
    forwardAmount?: string;
    forwardPayload?: Base64String;
    customPayload?: Base64String;
    gasAmount?: string;
}

export type CreateTransferNftTransactionReturnType = TransactionRequest;

/**
 * Create a NFT transfer transaction request
 */
export const createTransferNftTransaction = async (
    appKit: AppKit,
    parameters: CreateTransferNftTransactionParameters,
): Promise<CreateTransferNftTransactionReturnType> => {
    const {
        nftAddress,
        recipientAddress,
        comment,
        responseDestination,
        queryId,
        forwardAmount,
        forwardPayload,
        customPayload,
        gasAmount,
    } = parameters;

    const wallet = getSelectedWallet(appKit);

    if (!wallet) {
        throw new Error('Wallet not connected');
    }

    const ownerAddress = wallet.getAddress();

    // forwardPayload takes priority, otherwise fall back to a comment payload
    let forwardPayloadCell: Cell | null = null;
    if (forwardPayload) {
        forwardPayloadCell = Cell.fromBase64(forwardPayload);
    } else if (comment) {
        forwardPayloadCell = createCommentPayload(comment);
    }

    // Create NFT transfer payload
    const nftPayload = beginCell()
        .store(
            storeNftTransferMessage({
                queryId: queryId ? BigInt(queryId) : 0n,
                newOwner: Address.parse(recipientAddress),
                responseDestination: Address.parse(responseDestination ?? ownerAddress),
                customPayload: customPayload ? Cell.fromBase64(customPayload) : null,
                forwardAmount: forwardAmount ? BigInt(forwardAmount) : DEFAULT_FORWARD_AMOUNT,
                forwardPayload: forwardPayloadCell,
            }),
        )
        .endCell();

    // Build transaction message
    const message: TransactionRequestMessage = {
        address: nftAddress,
        amount: gasAmount ?? DEFAULT_NFT_GAS_FEE,
        payload: asBase64(nftPayload.toBoc().toString('base64')),
    };

    return {
        messages: [message],
        fromAddress: ownerAddress,
    };
};
