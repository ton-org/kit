/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { compareAddress } from '@ton/appkit';
import type { GaslessSupportedAsset, UserFriendlyAddress } from '@ton/appkit';

import { useMinterStore } from '../minter-store';
import { USDT_MASTER_MAINNET } from '../../../../core/constants/tokens';

export interface EnableGaslessParams {
    /** Relayer-accepted assets. Used to seed `gaslessFeeAsset` on first enable. */
    supportedAssets: GaslessSupportedAsset[] | undefined;
}

/**
 * Turns gasless on and seeds `gaslessFeeAsset` if it isn't set yet — picks
 * USDT when the relayer accepts it, otherwise the first listed asset.
 *
 * Shared between the mint settings modal (Save) and the low-balance modal
 * (Switch to gasless) so both call sites converge on the same behaviour.
 */
export const enableGasless = ({ supportedAssets }: EnableGaslessParams): void => {
    const { gaslessFeeAsset } = useMinterStore.getState();

    const next: Partial<{ gaslessEnabled: boolean; gaslessFeeAsset: UserFriendlyAddress | null }> = {
        gaslessEnabled: true,
    };

    if (!gaslessFeeAsset && supportedAssets?.length) {
        const preferred = supportedAssets.find((asset) => compareAddress(asset.address, USDT_MASTER_MAINNET));
        next.gaslessFeeAsset = preferred?.address ?? supportedAssets[0].address;
    }

    useMinterStore.setState(next);
};
