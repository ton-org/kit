/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
    AppKit,
    Network,
    createTonConnectConnector,
    ApiClientTonApi,
    ApiClientToncenter,
    createTonCenterStreamingProvider,
} from '@ton/appkit';
import { createDeDustProvider } from '@ton/appkit/swap/dedust';
import { createOmnistonProvider } from '@ton/appkit/swap/omniston';
import { createTonstakersProvider } from '@ton/appkit/staking/tonstakers';
import { createTonApiGaslessProvider } from '@ton/appkit/gasless/tonapi';

import { ENV_TON_API_KEY_TESTNET, ENV_TON_API_KEY_MAINNET } from '@/core/configs/env';

const mainnetApiClient = new ApiClientToncenter({
    network: Network.mainnet(),
    apiKey: ENV_TON_API_KEY_MAINNET,
});

const testnetApiClient = new ApiClientToncenter({
    network: Network.testnet(),
    apiKey: ENV_TON_API_KEY_TESTNET,
});

const tetraApiClient = new ApiClientTonApi({
    network: Network.tetra(),
    endpoint: 'https://tetra.tonapi.io',
});

export const appKit = new AppKit({
    networks: {
        [Network.mainnet().chainId]: { apiClient: mainnetApiClient },
        [Network.testnet().chainId]: { apiClient: testnetApiClient },
        [Network.tetra().chainId]: { apiClient: tetraApiClient },
    },
    connectors: [
        createTonConnectConnector({
            tonConnectOptions: {
                manifestUrl: 'https://tonconnect-sdk-demo-dapp.vercel.app/tonconnect-manifest.json',
            },
        }),
    ],
    providers: [
        createOmnistonProvider(),
        createDeDustProvider(),
        createTonstakersProvider(),
        createTonCenterStreamingProvider({ network: Network.mainnet(), apiKey: ENV_TON_API_KEY_MAINNET }),
        createTonCenterStreamingProvider({ network: Network.testnet(), apiKey: ENV_TON_API_KEY_TESTNET }),
        // Note: `apiKey` is intentionally omitted. ENV_TON_API_KEY_MAINNET is a Toncenter v3 key
        // (hex format) — TonAPI uses a different base32 token format, so passing the Toncenter
        // key as Bearer here triggers a 401 "illegal base32 data" from TonAPI. The gasless
        // config endpoint is public; supply a real TonAPI key here if you need higher rate limits.
        createTonApiGaslessProvider({ network: Network.mainnet() }),
    ],
});
