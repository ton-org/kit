/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { AppKit } from '@ton/appkit';
import { getCryptoOnrampProviderMetadata } from '@ton/appkit';

export const getCryptoOnrampProviderMetadataExample = (appKit: AppKit) => {
    // SAMPLE_START: GET_CRYPTO_ONRAMP_PROVIDER_METADATA
    const metadata = getCryptoOnrampProviderMetadata(appKit, { providerId: 'layerswap' });
    console.log('Crypto onramp provider metadata:', metadata);
    // SAMPLE_END: GET_CRYPTO_ONRAMP_PROVIDER_METADATA
};
