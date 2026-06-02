/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { AppKit } from '../../core/app-kit';
import { getSelectedWallet } from '../wallets/get-selected-wallet';

export type GetSmartAccountAddressOptions = {
    applicationAddress: string;
    providerId: string;
};
export type GetSmartAccountAddressReturnType = Promise<string>;

/**
 * Gets the smart account address for a TVM wallet and application.
 *
 * @param appKit - The AppKit instance.
 * @param options - The options for getting the smart account address.
 * @returns The smart account address.
 */
export async function getSmartAccountAddress(
    appKit: AppKit,
    options: GetSmartAccountAddressOptions,
): GetSmartAccountAddressReturnType {
    const provider = appKit.crossChainManager.getProvider(options.providerId);
    const wallet = getSelectedWallet(appKit);
    if (!wallet) {
        throw new Error('No wallet connected');
    }

    const { applicationAddress } = options;

    return provider.getSmartAccountAddress(wallet.getAddress(), applicationAddress);
}
