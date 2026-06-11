/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { JettonInfo } from '@ton/walletkit';

import type { AppKit } from '../../core/app-kit';
import { toBounceableAddress, resolveNetwork, isJettonInfo } from '../../utils';
import type { Network } from '../../types/network';
import { getCacheKey } from '../../core/cache';

export interface GetJettonInfoOptions {
    address: string;
    network?: Network;
}

export type GetJettonInfoReturnType = JettonInfo | null;

const getJettonInfoCacheKey = getCacheKey('jetton-info');

export const getJettonInfo = async (
    appKit: AppKit,
    options: GetJettonInfoOptions,
): Promise<GetJettonInfoReturnType> => {
    const address = toBounceableAddress(options.address);
    const network = resolveNetwork(appKit, options.network);
    const cacheKey = getJettonInfoCacheKey(address, network.chainId);

    const cached = await appKit.cache.get(cacheKey);
    if (cached && isJettonInfo(cached)) return cached;

    const client = appKit.networkManager.getClient(network);

    const response = await client.jettonsByAddress({
        address,
        offset: 0,
        limit: 1,
    });

    const master = response.masters[0];
    if (!master) {
        return null;
    }

    // Keep the requested bounceable address as the canonical identifier.
    const result: GetJettonInfoReturnType = { ...master, address };

    await appKit.cache.set(cacheKey, result);

    return result;
};
