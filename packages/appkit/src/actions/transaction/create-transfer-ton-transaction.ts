/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { createCommentPayloadBase64, parseUnits } from '@ton/walletkit';

import type { TransactionRequest, TransactionRequestMessage, ExtraCurrencies } from '../../types/transaction';
import { asBase64 } from '../../utils';
import type { AppKit } from '../../core/app-kit';
import { getSelectedWallet } from '../wallets/get-selected-wallet';

export interface CreateTransferTonTransactionParameters {
    /** Recipient address */
    recipientAddress: string;
    /** Amount in TONs */
    amount: string;
    /** Human-readable text comment (will be converted to payload) */
    comment?: string;
    /** Message payload data encoded in Base64 (overrides comment if provided) */
    payload?: string;
    /** Initial state for deploying a new contract, encoded in Base64 */
    stateInit?: string;
    /** Additional currencies to include in the transfer */
    extraCurrency?: ExtraCurrencies;
}

export type CreateTransferTonTransactionReturnType = TransactionRequest;

/**
 * Create a TON transfer transaction request
 */
export const createTransferTonTransaction = (
    appKit: AppKit,
    parameters: CreateTransferTonTransactionParameters,
): CreateTransferTonTransactionReturnType => {
    const { recipientAddress, amount, comment, payload, stateInit, extraCurrency } = parameters;

    const wallet = getSelectedWallet(appKit);

    if (!wallet) {
        throw new Error('Wallet not connected');
    }

    const message: TransactionRequestMessage = {
        address: recipientAddress,
        amount: parseUnits(amount, 9).toString(),
        stateInit: stateInit ? asBase64(stateInit) : undefined,
        extraCurrency,
    };

    // Payload takes priority, otherwise use comment
    if (payload) {
        message.payload = asBase64(payload);
    } else if (comment) {
        message.payload = createCommentPayloadBase64(comment);
    }

    return {
        messages: [message],
        network: wallet.getNetwork(),
        fromAddress: wallet.getAddress(),
    };
};
