/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { AppKit } from '@ton/appkit';
import { getSignMessageSupport } from '@ton/appkit';

export const getSignMessageSupportExample = (appKit: AppKit) => {
    // SAMPLE_START: GET_SIGN_MESSAGE_SUPPORT
    const supported = getSignMessageSupport(appKit);

    console.log(supported ? 'Wallet supports SignMessage (gasless available)' : 'SignMessage not supported');
    // SAMPLE_END: GET_SIGN_MESSAGE_SUPPORT
};
