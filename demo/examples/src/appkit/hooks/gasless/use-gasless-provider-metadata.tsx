/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useGaslessProviderMetadata } from '@ton/appkit-react';

export const UseGaslessProviderMetadataExample = () => {
    // SAMPLE_START: USE_GASLESS_PROVIDER_METADATA
    const { data: metadata, isLoading } = useGaslessProviderMetadata();

    if (isLoading) return <div>Loading provider...</div>;
    if (!metadata) return null;

    return (
        <a href={metadata.url} target="_blank" rel="noreferrer">
            {metadata.logo && <img src={metadata.logo} alt="" width={16} height={16} />}
            {metadata.name}
        </a>
    );
    // SAMPLE_END: USE_GASLESS_PROVIDER_METADATA
};
