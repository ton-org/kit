/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * Discriminator for DeFi-style providers (swap quotes, staking, gasless relayers,
 * fiat onramp, crypto onramp).
 */
export type DefiProviderType = 'swap' | 'staking' | 'gasless' | 'onramp' | 'crypto-onramp';
