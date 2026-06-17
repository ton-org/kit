/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { AppKit } from '../../core/app-kit';

export interface SetDefaultCryptoOnrampProviderParameters {
    providerId: string;
}

export type SetDefaultCryptoOnrampProviderReturnType = void;

/**
 * Set the default crypto-onramp provider.
 * Subsequent quote, deposit and status calls will use this provider when none is specified.
 */
export const setDefaultCryptoOnrampProvider = (
    appKit: AppKit,
    parameters: SetDefaultCryptoOnrampProviderParameters,
): SetDefaultCryptoOnrampProviderReturnType => {
    appKit.cryptoOnrampManager.setDefaultProvider(parameters.providerId);
};
