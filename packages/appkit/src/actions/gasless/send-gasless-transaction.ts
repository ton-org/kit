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
import { compareAddress, getMaxOutgoingMessages, hasSignMessageSupport } from '../../utils';

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
 * @throws GaslessError(QUOTE_EXPIRED) when the quote's relayer-provided
 *         `validUntil` window has already passed. Checked before signing so the
 *         wallet is never prompted for a quote the relayer would reject anyway.
 * @throws GaslessError(WALLET_MISMATCH) when the quote was issued for a
 *         different address than the currently selected wallet (e.g. the active
 *         wallet was switched after the quote was fetched).
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

    // Fail fast on a dead quote before prompting the wallet to sign: the relayer
    // owns `validUntil`, so a passed deadline means the relayer would reject the
    // send anyway. Cheaper to surface a typed error here than to round-trip a
    // signature the relayer discards. A non-finite `validUntil` (missing/garbled
    // relayer response) is treated as expired rather than silently bypassing the
    // check (`n > undefined` is always false).
    if (!Number.isFinite(quote.validUntil) || Math.floor(Date.now() / 1000) > quote.validUntil) {
        throw new GaslessError(
            'Gasless quote has expired or is missing a validity window. Fetch a fresh quote before sending.',
            GaslessErrorCode.QuoteExpired,
            { validUntil: quote.validUntil },
        );
    }

    // Guard against the active wallet being switched between quote and send: the
    // quote is bound to the `from` the relayer echoed, and signing with a
    // different wallet would produce a BoC the relayer rejects. Skip when a
    // provider does not echo `from` (treat absence as "no claim", not mismatch).
    if (quote.from && !compareAddress(quote.from, wallet.getAddress())) {
        throw new GaslessError(
            'Gasless quote was issued for a different wallet than the selected one.',
            GaslessErrorCode.WalletMismatch,
            { quoteFrom: quote.from, wallet: wallet.getAddress() },
        );
    }

    // Gasless signs via `signMessage`, so the wallet must advertise the
    // `SignMessage` feature, and the quote's message bundle must fit the wallet's
    // `SignMessage` `maxMessages` cap. Checked before prompting so a wallet that
    // can't satisfy the request fails with a typed error instead of an opaque
    // bridge rejection.
    const features = wallet.getSupportedFeatures() ?? [];

    if (!hasSignMessageSupport(features)) {
        throw new GaslessError(
            'Connected wallet does not support the SignMessage feature required for gasless transactions.',
            GaslessErrorCode.SignMessageNotSupported,
        );
    }

    const maxMessages = getMaxOutgoingMessages(features, 'SignMessage');
    if (quote.messages.length > maxMessages) {
        throw new GaslessError(
            `Quote has ${quote.messages.length} messages but the wallet only supports up to ${maxMessages}.`,
            GaslessErrorCode.TooManyMessages,
            { messages: quote.messages.length, maxMessages },
        );
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
