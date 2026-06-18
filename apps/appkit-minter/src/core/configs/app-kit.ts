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
    createTonApiStreamingProvider,
} from '@ton/appkit';
import { createDeDustProvider } from '@ton/appkit/swap/dedust';
import { createOmnistonProvider } from '@ton/appkit/swap/omniston';
import { createTonstakersProvider } from '@ton/appkit/staking/tonstakers';
import { createLayerswapProvider } from '@ton/appkit/crypto-onramp/layerswap';
import { createDecentProvider } from '@ton/appkit/crypto-onramp/decent';
import { createTonApiGaslessProvider } from '@ton/appkit/gasless/tonapi';

import {
    ENV_TON_API_PROVIDER,
    ENV_TON_API_KEY_TESTNET,
    ENV_TON_API_KEY_MAINNET,
    ENV_TON_API_KEY_TETRA,
    ENV_DECENT_API_KEY,
    ENV_TONCONNECT_MANIFEST_URL,
} from '@/core/configs/env';

const useTonApi = ENV_TON_API_PROVIDER === 'tonapi';

// Switch the underlying API client between Toncenter and TonAPI based on the
// configured provider. When 'tonapi' is selected the keys below are treated as
// TonAPI keys; otherwise they are Toncenter keys.
const createApiClient = (network: Network, apiKey?: string) =>
    useTonApi ? new ApiClientTonApi({ network, apiKey }) : new ApiClientToncenter({ network, apiKey });

const mainnetApiClient = createApiClient(Network.mainnet(), ENV_TON_API_KEY_MAINNET);

const testnetApiClient = createApiClient(Network.testnet(), ENV_TON_API_KEY_TESTNET);

// Tetra is a TonAPI-only network, so it always uses the TonAPI client.
const tetraApiClient = new ApiClientTonApi({
    network: Network.tetra(),
    endpoint: 'https://tetra.tonapi.io',
    apiKey: ENV_TON_API_KEY_TETRA,
});

// Match the streaming provider to the configured API provider.
const createStreamingProvider = useTonApi ? createTonApiStreamingProvider : createTonCenterStreamingProvider;

// Pass the keys to the gasless relayer only when TonAPI is the configured
// provider — otherwise they are Toncenter keys and don't apply. Without a key
// it falls back to the public TonAPI endpoints.
const gaslessConfig =
    useTonApi && (ENV_TON_API_KEY_MAINNET || ENV_TON_API_KEY_TESTNET)
        ? {
              chains: {
                  [Network.mainnet().chainId]: { apiKey: ENV_TON_API_KEY_MAINNET },
                  [Network.testnet().chainId]: { apiKey: ENV_TON_API_KEY_TESTNET },
              },
          }
        : undefined;

export const appKit = new AppKit({
    networks: {
        [Network.mainnet().chainId]: { apiClient: mainnetApiClient },
        [Network.testnet().chainId]: { apiClient: testnetApiClient },
        [Network.tetra().chainId]: { apiClient: tetraApiClient },
    },
    connectors: [
        createTonConnectConnector({
            tonConnectOptions: {
                manifestUrl: ENV_TONCONNECT_MANIFEST_URL,
            },
        }),
    ],
    providers: [
        createOmnistonProvider(),
        createDeDustProvider(),
        createTonstakersProvider(),
        createLayerswapProvider(),
        createDecentProvider({ apiKey: ENV_DECENT_API_KEY }),
        createStreamingProvider({ network: Network.mainnet(), apiKey: ENV_TON_API_KEY_MAINNET }),
        createStreamingProvider({ network: Network.testnet(), apiKey: ENV_TON_API_KEY_TESTNET }),
        createTonApiGaslessProvider(gaslessConfig),
    ],
});
