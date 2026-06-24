/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * Per-chain TonAPI gasless settings.
 */
export interface TonApiGaslessChainConfig {
    /** TonAPI REST endpoint override for this chain (defaults to TonAPI's per-network host). */
    endpoint?: string;
    /** Bearer token used for this chain's TonAPI calls. */
    apiKey?: string;
}
