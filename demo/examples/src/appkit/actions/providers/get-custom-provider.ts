/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { AppKit, CustomProvider } from '@ton/appkit';
import { getCustomProvider } from '@ton/appkit';

interface MyCustomProvider extends CustomProvider {
    customAction: (params: unknown) => Promise<void>;
}

export const getCustomProviderExample = (appKit: AppKit) => {
    // SAMPLE_START: GET_CUSTOM_PROVIDER
    const provider = getCustomProvider<MyCustomProvider>(appKit, { id: 'my-provider' });

    if (provider) {
        console.log('Custom provider is available');
    }
    // SAMPLE_END: GET_CUSTOM_PROVIDER
};
