/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
    CryptoOnrampDeposit,
    CryptoOnrampDepositParams,
    CryptoOnrampProviderMetadata,
    CryptoOnrampQuote,
    CryptoOnrampQuoteParams,
    CryptoOnrampStatus,
    CryptoOnrampStatusParams,
    CryptoOnrampSupportedCurrencies,
} from '../models';
import type { DefiManagerAPI } from './DefiManagerAPI';
import type { DefiProvider } from './DefiProvider';

/**
 * Crypto onramp API interface exposed by CryptoOnrampManager
 */
export interface CryptoOnrampAPI extends DefiManagerAPI<CryptoOnrampProviderInterface> {
    /**
     * Get static metadata for a crypto onramp provider
     * @param providerId Provider identifier (optional, uses default if not specified)
     * @returns Provider metadata
     */
    getMetadata(providerId?: string): CryptoOnrampProviderMetadata;

    /**
     * Get a quote for onramping from another crypto asset into a TON asset
     * @param params Quote parameters (source currency/network, target currency, amount)
     * @param providerId Provider identifier (optional, uses default if not specified)
     * @returns A promise that resolves to a CryptoOnrampQuote
     */
    getQuote(params: CryptoOnrampQuoteParams, providerId?: string): Promise<CryptoOnrampQuote>;

    /**
     * Create a deposit for a previously obtained quote
     * @param params Deposit parameters (quote, user TON address)
     * @param providerId Provider identifier (optional, uses default if not specified)
     * @returns A promise that resolves to a CryptoOnrampDeposit
     */
    createDeposit(params: CryptoOnrampDepositParams, providerId?: string): Promise<CryptoOnrampDeposit>;

    /**
     * Get the status of a deposit
     * @param params - Deposit status parameters including the deposit ID
     * @returns Promise resolving to the deposit status
     */
    getStatus(params: CryptoOnrampStatusParams, providerId?: string): Promise<CryptoOnrampStatus>;

    /**
     * Discover supported source/destination currencies for a provider.
     * Source currencies are tokens the user can spend; destination currencies are TON-side
     * tokens the user can receive.
     * @param providerId Provider identifier (optional, uses default if not specified)
     * @returns Promise resolving to the supported currencies for both directions
     */
    getSupportedCurrencies(providerId?: string): Promise<CryptoOnrampSupportedCurrencies>;
}

/**
 * Interface that all crypto onramp providers must implement
 */
export interface CryptoOnrampProviderInterface<
    TQuoteOptions = unknown,
    TDepositOptions = unknown,
> extends DefiProvider {
    readonly type: 'crypto-onramp';

    /**
     * Unique identifier for the provider
     */
    readonly providerId: string;

    /**
     * Get static metadata for the provider (display name, logo, url).
     * @returns Provider metadata
     */
    getMetadata(): CryptoOnrampProviderMetadata;

    /**
     * Get a quote for onramping from another crypto asset into a TON asset
     * @param params Quote parameters including provider-specific options
     * @returns A promise that resolves to a CryptoOnrampQuote
     */
    getQuote(params: CryptoOnrampQuoteParams<TQuoteOptions>): Promise<CryptoOnrampQuote>;

    /**
     * Create a deposit for a previously obtained quote
     * @param params Deposit parameters including provider-specific options
     * @returns A promise that resolves to a CryptoOnrampDeposit
     */
    createDeposit(params: CryptoOnrampDepositParams<TDepositOptions>): Promise<CryptoOnrampDeposit>;

    /**
     * Get the status of a deposit
     * @param params - Deposit status parameters including the deposit ID
     * @returns Promise resolving to the deposit status
     */
    getStatus(params: CryptoOnrampStatusParams): Promise<CryptoOnrampStatus>;

    /**
     * Discover supported source/destination currencies. May involve network calls
     * (e.g. fetching the provider's `/sources` or `/paths` endpoint), or return a
     * statically-curated list when the provider has no enumeration API.
     */
    getSupportedCurrencies(): Promise<CryptoOnrampSupportedCurrencies>;
}
