/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { SwapProviderMetadata } from '@ton/walletkit';

import type { AppKit } from '../../core/app-kit';

export type GetSwapProviderMetadataOptions = {
    providerId?: string;
};

export type GetSwapProviderMetadataReturnType = Promise<SwapProviderMetadata>;

/**
 * Get swap provider static metadata
 */
export const getSwapProviderMetadata = async (
    appKit: AppKit,
    options: GetSwapProviderMetadataOptions = {},
): GetSwapProviderMetadataReturnType => {
    return appKit.swapManager.getMetadata(options.providerId);
};
