/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useStakingSupportedNetworks } from '@ton/appkit-react';

export const UseStakingSupportedNetworksExample = () => {
    // SAMPLE_START: USE_STAKING_SUPPORTED_NETWORKS
    const { data: networks } = useStakingSupportedNetworks({ providerId: 'tonstakers' });
    return (
        <ul>
            {networks?.map((n) => (
                <li key={n.chainId}>{n.chainId}</li>
            ))}
        </ul>
    );
    // SAMPLE_END: USE_STAKING_SUPPORTED_NETWORKS
};
