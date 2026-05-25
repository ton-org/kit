/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { GaslessError, GaslessErrorCode } from '../../gasless';
import type { GaslessQuote, GaslessSendResponse } from '../../gasless';
import type { AppKit } from '../../core/app-kit';
import { getSelectedWallet } from '../wallets/get-selected-wallet';

export interface SendGaslessTransactionParameters {
    /** Pre-computed quote obtained via `getGaslessQuote` */
    quote: GaslessQuote;
    /** Gasless provider id. Uses the default provider when omitted. */
    providerId?: string;
}

/**
 * Return type is `GaslessSendResponse` — `SendTransactionResponse` plus
 * `internalBoc`. Consumers can drop `result.boc` straight into
 * `getTransactionStatus({ boc })` or build explorer links from
 * `result.normalizedHash` the same way as regular `sendTransaction`.
 */
export type SendGaslessTransactionReturnType = GaslessSendResponse;

export type SendGaslessTransactionErrorType = Error;

/**
 * Sign a previously computed gasless quote and submit the resulting BoC
 * to the relayer.
 *
 * Quote freshness is owned by the query layer (`getGaslessQuoteQueryOptions`
 * sets a 2-minute `staleTime` matching the relayer `validUntil` window). If a
 * stale quote is submitted anyway, the relayer rejects it and the error
 * surfaces through `gaslessManager.sendTransaction`.
 *
 * @throws GaslessError(SIGN_MESSAGE_NOT_SUPPORTED) when the wallet does not
 *         advertise the `SignMessage` feature.
 * @throws GaslessError(TOO_MANY_MESSAGES) when the quote carries more
 *         messages than the wallet's advertised `maxMessages` cap.
 * @throws GaslessError(SEND_FAILED) when the relayer accepts the BoC but
 *         omits the broadcasted external message in its response.
 */
export const sendGaslessTransaction = async (
    appKit: AppKit,
    parameters: SendGaslessTransactionParameters,
): Promise<SendGaslessTransactionReturnType> => {
    const { quote, providerId } = parameters;

    const wallet = getSelectedWallet(appKit);

    if (!wallet) {
        throw new Error('Wallet not connected');
    }

    const features = wallet.getSupportedFeatures();
    if (features !== undefined) {
        const signMessageFeature = features.find((f) => typeof f === 'object' && f.name === 'SignMessage');
        if (!signMessageFeature) {
            throw new GaslessError(
                'Connected wallet does not support the SignMessage feature required for gasless transactions.',
                GaslessErrorCode.SignMessageNotSupported,
            );
        }
        const { maxMessages } = signMessageFeature as { maxMessages: number };
        if (quote.messages.length > maxMessages) {
            throw new GaslessError(
                `Quote has ${quote.messages.length} messages but the wallet only supports up to ${maxMessages}.`,
                GaslessErrorCode.TooManyMessages,
                { messages: quote.messages.length, maxMessages },
            );
        }
    }

    const { internalBoc } = await wallet.signMessage({
        messages: quote.messages,
        validUntil: quote.validUntil,
    });

    return appKit.gaslessManager.sendTransaction(
        {
            network: quote.network,
            walletPublicKey: wallet.getPublicKey(),
            internalBoc,
        },
        providerId,
    );
};
