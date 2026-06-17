/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { AppKit } from '../../core/app-kit';

export interface SetDefaultGaslessProviderParameters {
    providerId: string;
}

export type SetDefaultGaslessProviderReturnType = void;

/**
 * Set the default gasless provider.
 * Subsequent estimate and send calls will use this provider when none is specified.
 */
export const setDefaultGaslessProvider = (
    appKit: AppKit,
    parameters: SetDefaultGaslessProviderParameters,
): SetDefaultGaslessProviderReturnType => {
    appKit.gaslessManager.setDefaultProvider(parameters.providerId);
};
