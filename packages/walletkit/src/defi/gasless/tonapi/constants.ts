/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { GaslessProviderMetadata } from '../../../api/models';

/** Default provider id used when none is supplied in the config. */
export const DEFAULT_PROVIDER_ID = 'tonapi';

/** Static metadata returned by `TonApiGaslessProvider.getMetadata()`. */
export const DEFAULT_METADATA: GaslessProviderMetadata = {
    name: 'TonAPI',
    url: 'https://tonapi.io',
};

/** Default number of retries for `/v2/gasless/send` on transient failures (5xx / network). */
export const DEFAULT_SEND_RETRIES = 5;

/** Fixed delay between send retries (ms). */
export const DEFAULT_SEND_RETRY_DELAY_MS = 1000;

/** Default number of retries for `/v2/gasless/estimate` on transient failures (5xx / network). */
export const DEFAULT_QUOTE_RETRIES = 5;

/** Fixed delay between quote retries (ms). */
export const DEFAULT_QUOTE_RETRY_DELAY_MS = 1000;

/**
 * Default TTL for the in-memory `/v2/gasless/config` cache (ms). The relayer
 * config (relay address + supported fee jettons) is essentially static, so a
 * coarse TTL avoids hammering TonAPI when `getConfig` runs on every quote.
 */
export const DEFAULT_CONFIG_CACHE_TTL_MS = 5 * 60 * 1000;
