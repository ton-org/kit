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
import { createLayerswapProvider } from '@ton/appkit/crypto-onramp/layerswap';
import { createDecentProvider } from '@ton/appkit/crypto-onramp/decent';
import { createTonApiGaslessProvider } from '@ton/appkit/gasless/tonapi';

import {
    ENV_TON_API_KEY_TESTNET,
    ENV_TON_API_KEY_MAINNET,
    ENV_DECENT_API_KEY,
    ENV_TONCONNECT_MANIFEST_URL,
} from '@/core/configs/env';
import {
    DEMO_WALLET_APP_URL,
    DEMO_WALLET_BRIDGE_URL,
    DEMO_WALLET_NAME,
    DEMO_WALLET_UNIVERSAL_LINK,
} from '@/features/connect-wallet/constants';

// Absolute icon URL — the stock TON Connect modal loads it directly, so it must
// not be root-relative. Falls back to the demo wallet's own host off-browser.
const demoWalletIconUrl =
    typeof window !== 'undefined'
        ? new URL('/ton-wallet.png', window.location.origin).href
        : `${DEMO_WALLET_APP_URL}/ton-wallet.png`;

// Where wallets send the user back after they approve. On mobile the stock modal
// deep-links away from this tab, so the demo wallet needs an explicit return URL
// (it reads the `ret` param that `returnStrategy` injects). Desktop's custom
// modal sets its own `ret` and is unaffected.
const dappReturnUrl = (typeof window !== 'undefined' ? window.location.origin : DEMO_WALLET_APP_URL) as
    | 'back'
    | 'none'
    | `${string}://${string}`;

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
                manifestUrl: ENV_TONCONNECT_MANIFEST_URL,
                // Return the user to the dApp after approving (so the demo wallet
                // auto-returns on mobile, mirroring the desktop one-click flow).
                actionsConfiguration: {
                    returnStrategy: dappReturnUrl,
                },
                // Surface the demo wallet inside the stock TON Connect modal
                // (used on mobile, where tapping it deep-links to the universal
                // link and connects over the bridge).
                walletsListConfiguration: {
                    includeWallets: [
                        {
                            appName: 'demo-wallet',
                            name: DEMO_WALLET_NAME,
                            imageUrl: demoWalletIconUrl,
                            aboutUrl: DEMO_WALLET_APP_URL,
                            universalLink: DEMO_WALLET_UNIVERSAL_LINK,
                            bridgeUrl: DEMO_WALLET_BRIDGE_URL,
                            platforms: ['ios', 'android', 'macos', 'windows', 'linux'],
                        },
                    ],
                },
            },
        }),
    ],
    providers: [
        createOmnistonProvider(),
        createDeDustProvider(),
        createTonstakersProvider(),
        createLayerswapProvider(),
        createDecentProvider({ apiKey: ENV_DECENT_API_KEY }),
        createTonCenterStreamingProvider({ network: Network.mainnet(), apiKey: ENV_TON_API_KEY_MAINNET }),
        createTonCenterStreamingProvider({ network: Network.testnet(), apiKey: ENV_TON_API_KEY_TESTNET }),
        createTonApiGaslessProvider(),
    ],
});
