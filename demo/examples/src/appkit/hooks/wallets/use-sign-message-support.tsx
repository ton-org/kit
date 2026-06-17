/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useSignMessageSupport } from '@ton/appkit-react';

export const UseSignMessageSupportExample = () => {
    // SAMPLE_START: USE_SIGN_MESSAGE_SUPPORT
    const hasSignMessageSupport = useSignMessageSupport();

    return <p>{hasSignMessageSupport ? 'Wallet supports SignMessage' : 'SignMessage not supported'}</p>;
    // SAMPLE_END: USE_SIGN_MESSAGE_SUPPORT
};
