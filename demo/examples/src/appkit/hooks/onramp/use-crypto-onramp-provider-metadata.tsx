/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useCryptoOnrampProviderMetadata } from '@ton/appkit-react';

export const UseCryptoOnrampProviderMetadataExample = () => {
    // SAMPLE_START: USE_CRYPTO_ONRAMP_PROVIDER_METADATA
    const metadata = useCryptoOnrampProviderMetadata({ providerId: 'layerswap' });
    return <div>Provider name: {metadata?.name}</div>;
    // SAMPLE_END: USE_CRYPTO_ONRAMP_PROVIDER_METADATA
};
