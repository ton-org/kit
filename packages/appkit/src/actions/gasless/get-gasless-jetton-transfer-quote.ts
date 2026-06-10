/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { GaslessQuote } from '../../gasless';
import type { UserFriendlyAddress } from '../../types/primitives';
import type { AppKit } from '../../core/app-kit';
import { createTransferJettonTransaction } from '../jettons/create-transfer-jetton-transaction';
import { getGaslessConfig } from './get-gasless-config';
import { getGaslessQuote } from './get-gasless-quote';

export interface GetGaslessJettonTransferQuoteOptions {
    /** Jetton master address to transfer */
    jettonAddress: string;
    /** Recipient address */
    recipientAddress: string;
    /** Human-readable amount of jettons to transfer */
    amount: string;
    /** Jetton decimals. Auto-fetched from jetton info when omitted. */
    jettonDecimals?: number;
    /** Optional text comment attached to the transfer */
    comment?: string;
    /**
     * Asset address used to pay the relayer's fee (jetton master for TonAPI).
     * Omit only for free / sponsored providers — see {@link getGaslessQuote}.
     */
    feeAsset?: UserFriendlyAddress;
    /** Gasless provider id. Uses the default provider when omitted. */
    providerId?: string;
}

export type GetGaslessJettonTransferQuoteReturnType = Promise<GaslessQuote>;

export type GetGaslessJettonTransferQuoteErrorType = Error;

/**
 * Build a gasless quote for a jetton transfer.
 *
 * Convenience wrapper that assembles the transfer messages the same way as
 * {@link createTransferJettonTransaction} (resolving the jetton wallet address,
 * decimals and payload) and forwards them to {@link getGaslessQuote}. The result
 * is passed verbatim to `sendGaslessTransaction`, preserving the quote → send
 * two-step flow.
 *
 * The jetton `responseDestination` (excess receiver) is set to the relayer's
 * address — the relayer paid the gas, so the unspent TON goes back to it rather
 * than to the user's wallet.
 *
 * The quote is always bound to the selected wallet's network — the same network
 * the message builder resolves the jetton wallet on — so there is no `network`
 * override (a mismatch would build the message on one chain and quote on another).
 */
export const getGaslessJettonTransferQuote = async (
    appKit: AppKit,
    options: GetGaslessJettonTransferQuoteOptions,
): GetGaslessJettonTransferQuoteReturnType => {
    const { jettonAddress, recipientAddress, amount, jettonDecimals, comment, feeAsset, providerId } = options;

    const { relayAddress } = await getGaslessConfig(appKit, { providerId });
    const { messages } = await createTransferJettonTransaction(appKit, {
        jettonAddress,
        recipientAddress,
        amount,
        jettonDecimals,
        comment,
        responseDestination: relayAddress,
    });

    return getGaslessQuote(appKit, { messages, feeAsset, providerId });
};
