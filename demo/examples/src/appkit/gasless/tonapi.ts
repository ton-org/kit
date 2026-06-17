/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { AppKit, Network } from '@ton/appkit';
import { createTonApiGaslessProvider } from '@ton/appkit/gasless/tonapi';

export const gaslessProviderInitExample = () => {
    // SAMPLE_START: GASLESS_PROVIDER_INIT
    // Initialize AppKit with the TonAPI gasless provider.
    // With no arguments, the factory auto-registers every network the kit was configured with.
    const appKit = new AppKit({
        networks: {
            [Network.mainnet().chainId]: {
                apiClient: { url: 'https://toncenter.com', key: 'your-key' },
            },
        },
        providers: [createTonApiGaslessProvider()],
    });
    // SAMPLE_END: GASLESS_PROVIDER_INIT

    return appKit;
};

export const gaslessProviderChainsExample = () => {
    // SAMPLE_START: GASLESS_PROVIDER_CHAINS
    // Per-chain overrides — pass an `apiKey` and/or `endpoint` per network.
    const appKit = new AppKit({
        networks: {
            [Network.mainnet().chainId]: {
                apiClient: { url: 'https://toncenter.com', key: 'your-key' },
            },
        },
        providers: [
            createTonApiGaslessProvider({
                chains: {
                    [Network.mainnet().chainId]: { apiKey: process.env.TON_API_KEY },
                },
            }),
        ],
    });
    // SAMPLE_END: GASLESS_PROVIDER_CHAINS

    return appKit;
};
