/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { AppKit } from '@ton/appkit';
import { watchSignMessageSupport } from '@ton/appkit';

export const watchSignMessageSupportExample = (appKit: AppKit) => {
    // SAMPLE_START: WATCH_SIGN_MESSAGE_SUPPORT
    const unsubscribe = watchSignMessageSupport(appKit, {
        onChange: (supported) => {
            console.log('SignMessage support changed:', supported);
        },
    });

    // Later: unsubscribe();
    // SAMPLE_END: WATCH_SIGN_MESSAGE_SUPPORT
    return unsubscribe;
};
