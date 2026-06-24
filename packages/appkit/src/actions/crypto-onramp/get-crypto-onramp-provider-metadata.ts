/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { CryptoOnrampProviderMetadata } from '../../crypto-onramp';
import type { AppKit } from '../../core/app-kit';

export interface GetCryptoOnrampProviderMetadataOptions {
    providerId?: string;
}

export type GetCryptoOnrampProviderMetadataReturnType = CryptoOnrampProviderMetadata;

/**
 * Get static metadata for a crypto-onramp provider (display name, logo, url).
 */
export const getCryptoOnrampProviderMetadata = (
    appKit: AppKit,
    options: GetCryptoOnrampProviderMetadataOptions = {},
): GetCryptoOnrampProviderMetadataReturnType => {
    return appKit.cryptoOnrampManager.getMetadata(options.providerId);
};
