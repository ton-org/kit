/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useGaslessProviders } from '@ton/appkit-react';

export const UseGaslessProvidersExample = () => {
    // SAMPLE_START: USE_GASLESS_PROVIDERS
    const providers = useGaslessProviders();
    return (
        <ul>
            {providers.map((p) => (
                <li key={p.providerId}>{p.providerId}</li>
            ))}
        </ul>
    );
    // SAMPLE_END: USE_GASLESS_PROVIDERS
};
