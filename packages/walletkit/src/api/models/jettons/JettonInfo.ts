/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * Verification status of a Jetton.
 */
export interface JettonVerification {
    /**
     * Indicates whether the jetton has been verified
     */
    verified: boolean;

    /**
     * Source of the verification
     */
    source?: 'toncenter' | 'community' | 'manual';

    /**
     * Warnings associated with the jetton
     */
    warnings?: string[];
}

/**
 * Detailed information about a Jetton master contract.
 */
export interface JettonInfo {
    /**
     * The Jetton master contract address
     */
    address: string;

    /**
     * The token name
     */
    name: string;

    /**
     * The token symbol
     */
    symbol: string;

    /**
     * The token description
     */
    description: string;

    /**
     * The number of decimal places used by the token
     * @format int
     */
    decimals?: number;

    /**
     * Total supply in the token's smallest units
     * @format bigInt
     */
    totalSupply?: string;

    /**
     * URL of the token image
     */
    image?: string;

    /**
     * Inline base64-encoded image data
     */
    image_data?: string;

    /**
     * URI pointing to the token metadata
     */
    uri?: string;

    /**
     * Verification status of the jetton
     */
    verification?: JettonVerification;

    /**
     * Additional arbitrary metadata related to the jetton
     */
    metadata?: { [key: string]: unknown };
}
