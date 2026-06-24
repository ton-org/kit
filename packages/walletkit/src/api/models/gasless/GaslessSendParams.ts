/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { Network } from '../core/Network';
import type { Base64String, Hex } from '../core/Primitives';

/**
 * Parameters to submit a signed gasless transaction to the relayer.
 */
export interface GaslessSendParams {
    /** Network the signed BoC was produced for */
    network: Network;
    /** Sender wallet public key */
    walletPublicKey: Hex;
    /** Signed internal-message BoC obtained from `wallet.signMessage` */
    internalBoc: Base64String;
}
