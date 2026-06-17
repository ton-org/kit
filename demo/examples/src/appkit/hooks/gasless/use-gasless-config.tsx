/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useGaslessConfig } from '@ton/appkit-react';

export const UseGaslessConfigExample = () => {
    // SAMPLE_START: USE_GASLESS_CONFIG
    const { data: config, isLoading } = useGaslessConfig();

    if (isLoading) return <div>Loading gasless config...</div>;

    return (
        <div>
            <p>Relay: {config?.relayAddress}</p>
            <select>
                {config?.supportedAssets.map((asset) => (
                    <option key={asset.address} value={asset.address}>
                        {asset.address}
                    </option>
                ))}
            </select>
        </div>
    );
    // SAMPLE_END: USE_GASLESS_CONFIG
};
