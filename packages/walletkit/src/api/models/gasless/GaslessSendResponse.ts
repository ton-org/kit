/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { Base64String } from '../core/Primitives';
import type { SendTransactionResponse } from '../transactions/SendTransactionResponse';

/**
 * Response from a gasless send. Extends `SendTransactionResponse` (`boc`,
 * `normalizedBoc`, `normalizedHash` of the broadcasted external-in message)
 * with the signed internal-message BoC produced by `wallet.signMessage` for
 * the relayer to wrap.
 */
export interface GaslessSendResponse extends SendTransactionResponse {
    /** Signed internal-message BoC produced by `wallet.signMessage`. */
    internalBoc: Base64String;
}
