/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { GaslessProviderInterface } from '../../gasless';
import type { AppKit } from '../../core/app-kit';

export type GetGaslessProvidersReturnType = GaslessProviderInterface[];

/**
 * Get all registered gasless providers.
 */
export const getGaslessProviders = (appKit: AppKit): GetGaslessProvidersReturnType => {
    return appKit.gaslessManager.getProviders();
};
