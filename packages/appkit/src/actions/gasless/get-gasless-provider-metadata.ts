/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { GaslessProviderMetadata } from '../../gasless';
import type { AppKit } from '../../core/app-kit';

export interface GetGaslessProviderMetadataOptions {
    /** Gasless provider id. Uses the default provider when omitted. */
    providerId?: string;
}

export type GetGaslessProviderMetadataReturnType = Promise<GaslessProviderMetadata>;

export type GetGaslessProviderMetadataErrorType = Error;

/**
 * Get static metadata for a gasless provider (display name, logo, url).
 */
export const getGaslessProviderMetadata = async (
    appKit: AppKit,
    options: GetGaslessProviderMetadataOptions = {},
): GetGaslessProviderMetadataReturnType => {
    return appKit.gaslessManager.getMetadata(options.providerId);
};
