/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { GaslessSupportedAsset } from '../../gasless';
import type { AppKit } from '../../core/app-kit';
import type { Network } from '../../types/network';
import { getSelectedWallet } from '../wallets/get-selected-wallet';

export interface GetGaslessSupportedAssetsOptions {
    /** Network to query. Defaults to the selected wallet's network, then provider's first supported. */
    network?: Network;
    /** Gasless provider id. Uses the default provider when omitted. */
    providerId?: string;
}

export type GetGaslessSupportedAssetsReturnType = Promise<GaslessSupportedAsset[]>;

export type GetGaslessSupportedAssetsErrorType = Error;

/**
 * Discover the assets the gasless relayer accepts as fee payment.
 */
export const getGaslessSupportedAssets = async (
    appKit: AppKit,
    options: GetGaslessSupportedAssetsOptions = {},
): GetGaslessSupportedAssetsReturnType => {
    const network = options.network ?? getSelectedWallet(appKit)?.getNetwork();
    return appKit.gaslessManager.getSupportedAssets(network, options.providerId);
};
