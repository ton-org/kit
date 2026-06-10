/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { compareAddress } from '@ton/appkit';
import type { GaslessSupportedAsset } from '@ton/appkit';

import { useMinterStore } from '../minter-store';
import { USDT_MASTER_MAINNET } from '../../../../core/constants/tokens';

/**
 * Seeds `gaslessFeeAsset` from the relayer's supported assets — USDT preferred,
 * otherwise the first listed. Idempotent: a no-op once a fee asset is already
 * chosen or when the supported list is empty.
 *
 * Called reactively as the relayer config resolves (see `useMintNft`), so the
 * default is applied regardless of whether the config had loaded at the moment
 * gasless was enabled.
 */
export const seedGaslessFeeAsset = (supportedAssets: GaslessSupportedAsset[]): void => {
    const { gaslessFeeAsset } = useMinterStore.getState();
    if (gaslessFeeAsset || supportedAssets.length === 0) return;

    const preferred = supportedAssets.find((asset) => compareAddress(asset.address, USDT_MASTER_MAINNET));
    useMinterStore.setState({ gaslessFeeAsset: preferred?.address ?? supportedAssets[0].address });
};
