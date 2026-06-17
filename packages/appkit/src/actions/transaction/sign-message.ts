/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { TransactionRequest } from '../../types/transaction';
import type { SignMessageResponse } from '../../types/signing';
import type { AppKit } from '../../core/app-kit';
import { getMaxOutgoingMessages, hasSignMessageSupport } from '../../utils';
import { getSelectedWallet } from '../wallets/get-selected-wallet';

export type SignMessageParameters = TransactionRequest;

export type SignMessageReturnType = SignMessageResponse;

export type SignMessageErrorType = Error;

/**
 * Ask the connected wallet to sign a transaction-shaped request without broadcasting it.
 *
 * Returns a signed internal-message BoC that can be relayed on-chain by a third party
 * (e.g. a gasless relayer). Unlike sendTransaction, the message is NOT submitted to the
 * network by the wallet.
 *
 * Throws when the connected wallet does not advertise the `SignMessage` feature, or when
 * the request carries more messages than the wallet's `SignMessage` `maxMessages` cap —
 * surfacing a clear error before prompting instead of an opaque bridge rejection.
 */
export const signMessage = async (
    appKit: AppKit,
    parameters: SignMessageParameters,
): Promise<SignMessageReturnType> => {
    const wallet = getSelectedWallet(appKit);

    if (!wallet) {
        throw new Error('Wallet not connected');
    }

    const features = wallet.getSupportedFeatures() ?? [];

    if (!hasSignMessageSupport(features)) {
        throw new Error('Connected wallet does not support the SignMessage feature.');
    }

    const maxMessages = getMaxOutgoingMessages(features, 'SignMessage');
    if (parameters.messages.length > maxMessages) {
        throw new Error(
            `SignMessage request has ${parameters.messages.length} messages but the wallet supports up to ${maxMessages}.`,
        );
    }

    return wallet.signMessage(parameters);
};
