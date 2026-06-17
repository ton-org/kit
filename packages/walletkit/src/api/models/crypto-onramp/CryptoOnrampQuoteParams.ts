/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { CryptoOnrampDestinationCurrency, CryptoOnrampSourceCurrency } from './CryptoOnrampCurrency';

/**
 * Parameters for requesting a crypto-to-crypto onramp quote.
 *
 * The target network is always TON, so only the source side carries chain info.
 */
export interface CryptoOnrampQuoteParams<TProviderOptions = unknown> {
    /**
     * Amount to onramp (either source or target crypto, depending on isSourceAmount)
     */
    amount: string;

    /**
     * Source currency the user is spending. Carries chain (CAIP-2), address, symbol,
     * decimals — everything the provider needs to build its API request.
     */
    sourceCurrency: CryptoOnrampSourceCurrency;

    /**
     * Target currency the user receives on TON.
     */
    targetCurrency: CryptoOnrampDestinationCurrency;

    /**
     * TON address that will receive the target crypto
     */
    recipientAddress: string;

    /**
     * Refund address for the source crypto
     */
    refundAddress?: string;

    /**
     * If true, `amount` is the source amount to spend.
     * If false, `amount` is the target amount to receive.
     * Defaults to true when omitted.
     */
    isSourceAmount?: boolean;

    /**
     * Provider-specific options
     */
    providerOptions?: TProviderOptions;
}
