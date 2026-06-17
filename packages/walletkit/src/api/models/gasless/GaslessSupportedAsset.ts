/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { UserFriendlyAddress } from '../core/Primitives';

/**
 * An asset the relayer accepts as fee payment.
 *
 * Address shape is currently always a jetton master (TonAPI's only supported
 * mode), but the type is intentionally generic so future relayers can
 * advertise NFT items or other assets without re-shaping the model.
 */
export interface GaslessSupportedAsset {
    /** Asset address — jetton master, NFT item, etc. */
    address: UserFriendlyAddress;
}
