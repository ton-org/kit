/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

export const ENV_TON_API_KEY_MAINNET =
    import.meta.env.VITE_TON_API_KEY ?? '25a9b2326a34b39a5fa4b264fb78fb4709e1bd576fc5e6b176639f5b71e94b0d';
export const ENV_TON_API_KEY_TESTNET =
    import.meta.env.VITE_TON_API_TESTNET_KEY ?? 'd852b54d062f631565761042cccea87fa6337c41eb19b075e6c7fb88898a3992';
export const ENV_DECENT_API_KEY = import.meta.env.VITE_DECENT_API_KEY ?? '5c951bc81da566bbd030ba8e20724063';

const DEV_TONCONNECT_MANIFEST_URL = 'https://tonconnect-sdk-demo-dapp.vercel.app/tonconnect-manifest.json';
const PROD_TONCONNECT_MANIFEST_URL = import.meta.env.VITE_TONCONNECT_MANIFEST_URL ?? DEV_TONCONNECT_MANIFEST_URL;

export const ENV_TONCONNECT_MANIFEST_URL = import.meta.env.DEV
    ? DEV_TONCONNECT_MANIFEST_URL
    : PROD_TONCONNECT_MANIFEST_URL;

export const ENV_PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID ?? '';
export const ENV_GETGEMS_API_KEY: string = import.meta.env.VITE_GETGEMS_API_KEY ?? '';
