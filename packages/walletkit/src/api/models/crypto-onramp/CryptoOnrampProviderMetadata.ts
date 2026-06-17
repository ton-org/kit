/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * Static metadata for a crypto-onramp provider.
 */
export interface CryptoOnrampProviderMetadata {
    /**
     * Human-readable provider name (e.g. 'Decent')
     */
    name: string;

    /**
     * URL to the provider's logo image
     */
    logo?: string;

    /**
     * URL to the provider's website
     */
    url?: string;

    /**
     * Refund-address collection mode for this provider:
     * - `'off'` (default): no refund address — the UI skips the address modal entirely.
     * - `'optional'`: the UI shows the address modal with a "Skip" button — users may
     *   enter an address or proceed without one.
     * - `'required'`: the UI shows the address modal and blocks submission until a
     *   non-empty address is entered.
     */
    refundAddressMode?: 'off' | 'optional' | 'required';

    /**
     * Whether this provider supports reversed (target-amount) quotes.
     * When false, the UI should hide the direction toggle and only allow source-amount input.
     */
    isReversedAmountSupported?: boolean;
}

/**
 * Used in provider configuration to override fields of the provider's metadata.
 */
export interface CryptoOnrampProviderMetadataOverride {
    /**
     * Override the provider's display name
     */
    name?: string;

    /**
     * Override the provider's logo URL
     */
    logo?: string;

    /**
     * Override the provider's website URL
     */
    url?: string;
}
