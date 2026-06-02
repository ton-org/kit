/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { CrossChainProvider } from '@ton/walletkit';

import type { AppKit } from '../../core/app-kit';

export interface GetCrossChainProviderOptions {
    id: string;
}

export type GetCrossChainProviderReturnType = CrossChainProvider;

/**
 * Get cross-chain provider by ID
 */
export const getCrossChainProvider = (
    appKit: AppKit,
    options: GetCrossChainProviderOptions,
): GetCrossChainProviderReturnType => {
    return appKit.crossChainManager.getProvider(options.id);
};
