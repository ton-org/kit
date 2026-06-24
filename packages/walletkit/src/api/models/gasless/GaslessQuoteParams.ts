/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { Network } from '../core/Network';
import type { Hex, UserFriendlyAddress } from '../core/Primitives';
import type { TransactionRequestMessage } from '../transactions/TransactionRequest';

/**
 * Parameters to quote a gasless transaction.
 *
 * The relayer wraps the caller's messages with fee-collection logic and
 * returns a new set of messages that the wallet should sign via `signMessage`.
 */
export interface GaslessQuoteParams {
    /** Network the gasless transaction should run on */
    network: Network;
    /**
     * Asset address used to pay the relayer's fee. Today this is the master
     * address of a jetton (the only mode TonAPI supports), but the field is
     * intentionally generic — future providers may accept NFT items or other
     * assets and the provider decides at runtime which is supported.
     *
     * Omit (`undefined`) for free / sponsored providers that do not charge a
     * per-transaction fee. Jetton-only providers (e.g. TonAPI) throw
     * `GaslessError(UnsupportedOperation)` in that case.
     */
    feeAsset?: UserFriendlyAddress;
    /** Sender wallet address */
    walletAddress: UserFriendlyAddress;
    /** Sender wallet public key */
    walletPublicKey: Hex;
    /** Messages that the caller wants to include in the transaction */
    messages: TransactionRequestMessage[];
}
