/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { UserFriendlyAddress } from '../core/Primitives';
import type { GaslessSupportedAsset } from './GaslessSupportedAsset';

/**
 * Provider-level configuration for a gasless relayer on a given network.
 *
 * Bundles every piece of provider state a consumer needs to drive a gasless
 * transfer end-to-end:
 *  - `relayAddress` — where the relayer wants residual GRAM (e.g. jetton-transfer
 *    `responseDestination`) returned to.
 *  - `supportedAssets` — what the relayer accepts as fee payment.
 */
export interface GaslessConfig {
    /** Relayer address — for jetton-transfer `responseDestination` and similar. */
    relayAddress: UserFriendlyAddress;
    /** Assets the relayer accepts as fee payment. */
    supportedAssets: GaslessSupportedAsset[];
}
