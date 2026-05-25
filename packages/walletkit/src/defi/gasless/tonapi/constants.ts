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
export const DEFAULT_SEND_RETRIES = 3;

/** Base delay between send retries (ms). Subsequent retries use exponential backoff (2× per attempt). */
export const DEFAULT_SEND_RETRY_DELAY_MS = 2000;
