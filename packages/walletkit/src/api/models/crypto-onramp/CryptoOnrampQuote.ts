/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { CryptoOnrampDestinationCurrency, CryptoOnrampSourceCurrency } from './CryptoOnrampCurrency';

/**
 * Crypto onramp quote response with pricing information.
 */
export interface CryptoOnrampQuote<TMetadata = unknown> {
    /**
     * Source currency that will be spent. Mirrors the `sourceCurrency` from quote params,
     * possibly normalised by the provider.
     */
    sourceCurrency: CryptoOnrampSourceCurrency;

    /**
     * Target currency on TON the user receives.
     */
    targetCurrency: CryptoOnrampDestinationCurrency;

    /**
     * Amount of source crypto to send (in base units of `sourceCurrency.decimals`).
     * @format int
     */
    sourceAmount: string;

    /**
     * Amount of target crypto to receive (in base units of `targetCurrency.decimals`).
     * @format int
     */
    targetAmount: string;

    /**
     * Exchange rate (amount of target per 1 unit of source)
     */
    rate: string;

    /**
     * TON address that will receive the target crypto
     */
    recipientAddress: string;

    /**
     * Identifier of the crypto onramp provider
     */
    providerId: string;

    /**
     * Provider-specific metadata for the quote (e.g. raw response needed to execute)
     */
    metadata?: TMetadata;
}
