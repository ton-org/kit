/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { Network } from '../core/Network';
import type { UserFriendlyAddress } from '../core/Primitives';
import type { TokenAmount } from '../core/TokenAmount';
import type { TransactionRequestMessage } from '../transactions/TransactionRequest';

/**
 * Quote for a gasless transaction produced by `GaslessProvider.getQuote`.
 *
 * Contains relayer-wrapped messages that should be passed to `wallet.signMessage`
 * in place of the caller's original messages, together with the fee the relayer
 * will deduct and the timestamp after which the bundle expires.
 */
export interface GaslessQuote {
    /** Network the quote is bound to (mirrors the request `network`) */
    network: Network;
    /** Relayer-wrapped messages ready to be signed */
    messages: TransactionRequestMessage[];
    /** Relayer fee in fee-jetton nanounits */
    fee: TokenAmount;
    /** Unix timestamp after which the bundle becomes invalid for relay */
    validUntil: number;
    /** Sender wallet address echoed by the relayer */
    from: UserFriendlyAddress;
}
