/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useSwapProviderMetadata } from '@ton/appkit-react';

export const UseSwapProviderMetadataExample = () => {
    // SAMPLE_START: USE_SWAP_PROVIDER_METADATA
    const { data: metadata } = useSwapProviderMetadata({ providerId: 'stonfi' });
    return <div>Swap provider name: {metadata?.name}</div>;
    // SAMPLE_END: USE_SWAP_PROVIDER_METADATA
};
