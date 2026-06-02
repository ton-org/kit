/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { CrossChainProvider } from '@ton/walletkit';

import type { AppKit } from '../../core/app-kit';

export type GetCrossChainProvidersReturnType = CrossChainProvider[];

/**
 * Get all registered cross-chain providers
 */
export const getCrossChainProviders = (appKit: AppKit): GetCrossChainProvidersReturnType => {
    return appKit.crossChainManager.getProviders();
};
