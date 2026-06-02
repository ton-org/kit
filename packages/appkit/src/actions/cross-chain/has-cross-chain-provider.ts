/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { AppKit } from '../../core/app-kit';

export interface HasCrossChainProviderOptions {
    id: string;
}

export type HasCrossChainProviderReturnType = boolean;

/**
 * Check if a cross-chain provider is registered
 */
export const hasCrossChainProvider = (
    appKit: AppKit,
    options: HasCrossChainProviderOptions,
): HasCrossChainProviderReturnType => {
    return appKit.crossChainManager.hasProvider(options.id);
};
