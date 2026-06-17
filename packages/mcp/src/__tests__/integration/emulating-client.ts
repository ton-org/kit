/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { ApiClientToncenter, Network } from '@ton/walletkit';
import type { EmulationAction } from '@ton/walletkit';

import {
    createRateLimitedFetch,
    getApiClientRequestIntervalMs,
    resolveToncenterApiKey,
} from '../../utils/ton-client.js';

export interface InterceptedSend {
    boc: string;
    emulation: Awaited<ReturnType<ApiClientToncenter['fetchEmulation']>>;
}

/**
 * Testnet toncenter client for integration tests: all reads hit the real
 * network, but sendBoc never broadcasts — the signed BOC is routed to the
 * emulation endpoint instead and the result is captured for assertions.
 */
export class EmulatingToncenterClient extends ApiClientToncenter {
    readonly interceptedSends: InterceptedSend[] = [];

    constructor() {
        const apiKey = resolveToncenterApiKey('testnet');
        super({
            network: Network.testnet(),
            apiKey,
            fetchApi: createRateLimitedFetch(getApiClientRequestIntervalMs(apiKey)),
        });
    }

    override async sendBoc(boc: string): Promise<string> {
        const emulation = await this.fetchEmulation(boc, false);
        this.interceptedSends.push({ boc, emulation });
        return '';
    }

    lastIntercepted(): InterceptedSend {
        const last = this.interceptedSends[this.interceptedSends.length - 1];
        if (!last) {
            throw new Error('No intercepted sendBoc calls were captured');
        }
        return last;
    }
}

export function expectSuccessfulEmulation(intercepted: InterceptedSend): {
    actions: EmulationAction[];
    totalFees: bigint;
} {
    if (intercepted.emulation.result !== 'success') {
        throw new Error(`Captured BOC failed to emulate: ${JSON.stringify(intercepted.emulation.emulationError)}`);
    }
    const { actions, transactions, isIncomplete } = intercepted.emulation.emulationResult;
    if (isIncomplete) {
        throw new Error('Emulated trace is incomplete');
    }
    const failedActions = actions.filter((action) => !action.isSuccess);
    if (failedActions.length > 0) {
        throw new Error(`Emulated actions failed: ${failedActions.map((action) => action.type).join(', ')}`);
    }
    let totalFees = 0n;
    for (const transaction of Object.values(transactions)) {
        totalFees += BigInt(transaction.totalFees);
    }
    return { actions, totalFees };
}
