/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { DeviceInfo, TonWalletKit, WalletAdapter, WalletInfo, WalletSigner } from '@ton/walletkit';

/**
 * Reference to a native (Kotlin) callback passed by value across the bridge. The function itself
 * can't cross the boundary, so native sends this opaque handle; JS reconstructs a callable that
 * round-trips through the `callByReference` reverse-RPC method.
 */
export interface WrappedFunctionRef {
    __wrappedFn: string;
}

/**
 * Configuration and bridge-facing types for Ton WalletKit.
 */
export interface WalletKitBridgeInitConfig {
    bridgeUrl?: string;
    bridgeName?: string;
    allowMemoryStorage?: boolean;
    walletManifest?: WalletInfo;
    deviceInfo?: DeviceInfo;
    disableNetworkSend?: boolean;
    disableTransactionEmulation?: boolean;
    // Native fetchManifest callback, delivered as a wrapped-function reference (see WrappedFunctionRef).
    fetchManifest?: WrappedFunctionRef;
    /**
     * Network configurations matching native SDK format.
     * Each entry has a network with chainId and optional apiClientConfiguration.
     */
    networkConfigurations?: Array<{
        network: { chainId: string };
        apiClientConfiguration?: {
            url?: string;
            key?: string;
        };
        apiClientType?: 'default' | 'toncenter' | 'tonapi' | 'custom';
    }>;
}

export interface AndroidBridgeType {
    postMessage(json: string): void;
}

export interface WalletKitNativeBridgeType {
    postMessage(json: string): void;
    adapterCallSync(method: string, paramsJson: string): string;
}

export type WalletKitAdapter = WalletAdapter;
export type WalletKitSigner = WalletSigner;
export type WalletKitInstance = TonWalletKit;
