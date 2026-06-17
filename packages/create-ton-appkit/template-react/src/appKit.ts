// AppKit setup — https://docs.ton.org/applications/appkit/howto/appkit
import { AppKit, Network, createTonConnectConnector } from '@ton/appkit';
// Swap providers — https://docs.ton.org/applications/appkit/howto/providers#swaps
import { createOmnistonProvider } from '@ton/appkit/swap/omniston';
import { createDeDustProvider } from '@ton/appkit/swap/dedust';
// Staking providers — https://docs.ton.org/applications/appkit/howto/providers#staking
import { createTonstakersProvider } from '@ton/appkit/staking/tonstakers';

const TONCENTER_API_KEY = import.meta.env.VITE_TONCENTER_API_KEY as string | undefined;

const TONCONNECT_MANIFEST_URL =
    (import.meta.env.VITE_TONCONNECT_MANIFEST_URL as string | undefined) ??
    `${window.location.origin}/tonconnect-manifest.json`;

// Full guide: https://docs.ton.org/applications/appkit/get-started/get-started
export const appKit = new AppKit({
    // apiClient uses TonCenter here; AppKit also supports TonAPI as an alternative provider.
    networks: {
        [Network.mainnet().chainId]: {
            apiClient: { url: 'https://toncenter.com', key: TONCENTER_API_KEY },
        },
    },
    defaultNetwork: Network.mainnet(),
    // Connectors — https://docs.ton.org/applications/appkit/howto/connect-to-a-wallet#drop-in-button
    connectors: [
        createTonConnectConnector({
            tonConnectOptions: { manifestUrl: TONCONNECT_MANIFEST_URL },
        }),
    ],
    // DeFi providers — https://docs.ton.org/applications/appkit/howto/providers#how-they-are-registered
    providers: [createOmnistonProvider(), createDeDustProvider(), createTonstakersProvider()],
});
