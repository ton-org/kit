/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { GaslessProviderInterface } from '../../gasless';
import type { AppKit } from '../../core/app-kit';

export interface GetGaslessProviderOptions {
    id?: string;
}

export type GetGaslessProviderReturnType = GaslessProviderInterface;

export const getGaslessProvider = (
    appKit: AppKit,
    options: GetGaslessProviderOptions = {},
): GetGaslessProviderReturnType => {
    return appKit.gaslessManager.getProvider(options.id);
};
