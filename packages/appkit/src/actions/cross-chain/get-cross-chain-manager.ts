/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { CrossChainManager } from '@ton/walletkit';

import type { AppKit } from '../../core/app-kit';

export type GetCrossChainManagerReturnType = CrossChainManager;

/**
 * Get cross-chain manager instance
 */
export const getCrossChainManager = (appKit: AppKit): GetCrossChainManagerReturnType => {
    return appKit.crossChainManager;
};
