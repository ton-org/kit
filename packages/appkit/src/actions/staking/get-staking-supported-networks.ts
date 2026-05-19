/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { Network } from '@ton/walletkit';

import type { AppKit } from '../../core/app-kit';

export type GetStakingSupportedNetworksOptions = {
    providerId?: string;
};

export type GetStakingSupportedNetworksReturnType = Promise<Network[]>;

/**
 * Get networks supported by a staking provider
 */
export const getStakingSupportedNetworks = async (
    appKit: AppKit,
    options: GetStakingSupportedNetworksOptions = {},
): GetStakingSupportedNetworksReturnType => {
    return appKit.stakingManager.getSupportedNetworks(options.providerId);
};
