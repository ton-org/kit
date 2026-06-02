/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * Parameters for a TAC cross-chain transaction
 * @template {any} T - The type of a cross-chain message
 * @template {any[]} A - The type of the assets array
 * @template {any} O - The type of the options
 */
export type TacCrossChainTransactionParams<T, A = [], O = void> = {
    /**
     * The address of the sender
     */
    senderAddress: string;
    /**
     * The message to be used for execution on the destination chain
     */
    message: T;
    /**
     * Optional assets to be transferred
     */
    assets?: A;
    /**
     * Optional execution options
     */
    options?: O;
};
