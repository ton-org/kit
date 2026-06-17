/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { CustomProvider } from '@ton/appkit';
import { useCustomProvider } from '@ton/appkit-react';

interface MyCustomProvider extends CustomProvider {
    customAction: (params: unknown) => Promise<void>;
}

export const UseCustomProviderExample = () => {
    // SAMPLE_START: USE_CUSTOM_PROVIDER
    const provider = useCustomProvider<MyCustomProvider>('my-provider');

    if (!provider) {
        return <div>Custom provider not registered</div>;
    }

    return <div>Custom provider is ready</div>;
    // SAMPLE_END: USE_CUSTOM_PROVIDER
};
