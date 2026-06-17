/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { CryptoOnrampSourceCurrency } from './CryptoOnrampCurrency';

/**
 * Deposit details returned by a crypto onramp provider.
 *
 * The user must send `amount` of `sourceCurrency` to `address` to complete the onramp;
 * the provider then delivers the target crypto to the user's TON address.
 */
export interface CryptoOnrampDeposit {
    /**
     * Deposit id
     */
    depositId: string;

    /**
     * Deposit address on the source chain
     */
    address: string;

    /**
     * Exact amount of source crypto the user must send (in base units of `sourceCurrency.decimals`).
     */
    amount: string;

    /**
     * Source currency the user is sending. Mirrors the `sourceCurrency` from the originating quote.
     */
    sourceCurrency: CryptoOnrampSourceCurrency;

    /**
     * Optional memo / tag required by some chains (e.g. XRP, TON comment)
     */
    memo?: string;

    /**
     * Unix timestamp (ms) after which the deposit offer is no longer valid
     */
    expiresAt?: number;

    /**
     * Identifier of the provider that issued this deposit
     */
    providerId: string;
}
