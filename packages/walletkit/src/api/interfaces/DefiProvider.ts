/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { Network, BaseProvider, DefiProviderType } from '../models';

/**
 * Base interface for all DeFi providers
 */
export interface DefiProvider extends BaseProvider {
    readonly type: DefiProviderType;

    /**
     * Networks this provider can operate on. Consumers should check before calling provider methods.
     * Implementations may return a static list or compute it dynamically (e.g. from runtime config).
     * @returns Array of networks supported by this provider
     */
    getSupportedNetworks(): Network[];
}
