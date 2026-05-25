/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useGaslessSupportedAssets } from '@ton/appkit-react';

export const UseGaslessSupportedAssetsExample = () => {
    // SAMPLE_START: USE_GASLESS_SUPPORTED_ASSETS
    const { data: supportedAssets, isLoading } = useGaslessSupportedAssets();

    if (isLoading) return <div>Loading fee assets...</div>;

    return (
        <select>
            {supportedAssets?.map((asset) => (
                <option key={asset.address} value={asset.address}>
                    {asset.address}
                </option>
            ))}
        </select>
    );
    // SAMPLE_END: USE_GASLESS_SUPPORTED_ASSETS
};
