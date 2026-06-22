/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/** Human-readable name shown on the demo wallet tile. */
export const DEMO_WALLET_NAME = 'Wallet';

/**
 * Where the demo wallet (apps/demo-wallet) is served. In dev we target the
 * local Vite server (port 5173, its default) so the whole connect flow runs
 * against the local wallet; in production we fall back to the deployed app.
 */
const DEMO_WALLET_BASE_URL = import.meta.env.DEV ? 'http://localhost:5173' : 'https://kit-demo-wallet-git-appkit-demo-video-topteam.vercel.app';

/** Demo wallet app root — opened to bring it to the foreground for approvals. */
export const DEMO_WALLET_APP_URL = DEMO_WALLET_BASE_URL;

/**
 * Direct-link target for the demo wallet. The `/ton-connect` route reads
 * `window.location.href` and forwards the request to
 * `walletKit.handleTonConnectUrl`, so the universal link must point there.
 */
export const DEMO_WALLET_UNIVERSAL_LINK = `${DEMO_WALLET_BASE_URL}/ton-connect`;

/** HTTP bridge the demo wallet listens on (its `ENV_BRIDGE_URL` default). */
export const DEMO_WALLET_BRIDGE_URL = 'https://connect.ton.org/bridge';

/** Demo wallet icon (served by the demo wallet itself). */
export const DEMO_WALLET_ICON_URL = `${DEMO_WALLET_BASE_URL}/web-app-manifest-512x512.png`;
