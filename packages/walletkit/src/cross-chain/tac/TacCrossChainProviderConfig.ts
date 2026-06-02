/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { SDKParams } from '@tonappchain/sdk';

import type { Network } from '../../api/models';

/**
 * Configuration for the TAC cross-chain provider
 */
export interface TacCrossChainProviderConfig {
    /**
     * The network to use (mainnet or testnet)
     */
    network?: Network;
    /**
     * Optional configuration for the TAC SDK
     */
    sdkConfig?: SDKParams;
}
