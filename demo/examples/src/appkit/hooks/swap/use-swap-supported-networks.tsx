/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useSwapSupportedNetworks } from '@ton/appkit-react';

export const UseSwapSupportedNetworksExample = () => {
    // SAMPLE_START: USE_SWAP_SUPPORTED_NETWORKS
    const { data: networks } = useSwapSupportedNetworks({ providerId: 'stonfi' });
    return (
        <ul>
            {networks?.map((n) => (
                <li key={n.chainId}>{n.chainId}</li>
            ))}
        </ul>
    );
    // SAMPLE_END: USE_SWAP_SUPPORTED_NETWORKS
};
