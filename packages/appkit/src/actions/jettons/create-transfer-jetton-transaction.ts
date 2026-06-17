/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Address, beginCell, Cell } from '@ton/core';
import {
    storeJettonTransferMessage,
    createCommentPayload,
    getJettonWalletAddressFromClient,
    DEFAULT_JETTON_GAS_FEE,
    DEFAULT_FORWARD_AMOUNT,
    parseUnits,
} from '@ton/walletkit';

import type { TransactionRequest, TransactionRequestMessage } from '../../types/transaction';
import type { Base64String } from '../../types/primitives';
import type { AppKit } from '../../core/app-kit';
import { getSelectedWallet } from '../wallets/get-selected-wallet';
import { getJettonInfo } from './get-jetton-info';
import { asBase64, isNumber } from '../../utils';

export interface CreateTransferJettonTransactionParameters {
    jettonAddress: string;
    recipientAddress: string;
    amount: string;
    jettonDecimals?: number;
    comment?: string;
    responseDestination?: string;
    queryId?: string;
    forwardAmount?: string;
    forwardPayload?: Base64String;
    customPayload?: Base64String;
    gasAmount?: string;
}

export type CreateTransferJettonTransactionReturnType = TransactionRequest;

/**
 * Create a Jetton transfer transaction request
 */
export const createTransferJettonTransaction = async (
    appKit: AppKit,
    parameters: CreateTransferJettonTransactionParameters,
): Promise<CreateTransferJettonTransactionReturnType> => {
    const {
        jettonAddress,
        recipientAddress,
        amount,
        jettonDecimals,
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

    // Get client from network manager
    const network = wallet.getNetwork();
    const client = appKit.networkManager.getClient(network);

    // Get jetton wallet address
    const ownerAddress = wallet.getAddress();
    const jettonWalletAddress = await getJettonWalletAddressFromClient(client, jettonAddress, ownerAddress);

    let decimals = jettonDecimals;

    if (!isNumber(decimals)) {
        const jettonInfo = await getJettonInfo(appKit, { address: jettonAddress, network });

        if (!isNumber(jettonInfo?.decimals)) {
            throw new Error(`Jetton decimals not found for address ${jettonAddress}`);
        }

        decimals = jettonInfo.decimals;
    }

    // forwardPayload takes priority, otherwise fall back to a comment payload
    let forwardPayloadCell: Cell | null = null;
    if (forwardPayload) {
        forwardPayloadCell = Cell.fromBase64(forwardPayload);
    } else if (comment) {
        forwardPayloadCell = createCommentPayload(comment);
    }

    // Create jetton transfer payload
    const jettonPayload = beginCell()
        .store(
            storeJettonTransferMessage({
                queryId: queryId ? BigInt(queryId) : 0n,
                amount: parseUnits(amount, decimals),
                destination: Address.parse(recipientAddress),
                responseDestination: Address.parse(responseDestination ?? ownerAddress),
                customPayload: customPayload ? Cell.fromBase64(customPayload) : null,
                forwardAmount: forwardAmount ? BigInt(forwardAmount) : DEFAULT_FORWARD_AMOUNT,
                forwardPayload: forwardPayloadCell,
            }),
        )
        .endCell();

    // Build transaction message
    const message: TransactionRequestMessage = {
        address: jettonWalletAddress,
        amount: gasAmount ?? DEFAULT_JETTON_GAS_FEE,
        payload: asBase64(jettonPayload.toBoc().toString('base64')),
    };

    return {
        messages: [message],
        fromAddress: ownerAddress,
    };
};
