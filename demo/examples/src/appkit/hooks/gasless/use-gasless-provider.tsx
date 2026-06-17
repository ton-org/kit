/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useGaslessProvider } from '@ton/appkit-react';

export const UseGaslessProviderExample = () => {
    // SAMPLE_START: USE_GASLESS_PROVIDER
    const [provider, setProviderId] = useGaslessProvider();
    return (
        <div>
            <div>Current: {provider?.providerId ?? 'none'}</div>
            <button onClick={() => setProviderId('tonapi')}>Use TonApi</button>
        </div>
    );
    // SAMPLE_END: USE_GASLESS_PROVIDER
};
