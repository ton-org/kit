/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useNetwork, useSignMessageSupport } from '@ton/appkit-react';

import { getMintForwardAddress } from '../constants';

export interface CanEnableGaslessState {
    /** `hasSignMessage && isNetworkSupported` — the gate for the gasless toggle. */
    canEnable: boolean;
    /** The connected wallet advertises the `SignMessage` feature. */
    hasSignMessage: boolean;
    /** The current network has a deployed `MintForward` forwarder address. */
    isNetworkSupported: boolean;
}

/**
 * Availability of the gasless mint flow, broken down so the UI can both gate
 * the toggle (`canEnable`) and explain *why* it's unavailable (`hasSignMessage`
 * / `isNetworkSupported`). `canEnable` is `false` when no wallet is connected.
 */
export const useCanEnableGasless = (): CanEnableGaslessState => {
    const hasSignMessage = useSignMessageSupport();
    const network = useNetwork();

    const isNetworkSupported = network ? !!getMintForwardAddress(network.chainId) : false;

    return { canEnable: hasSignMessage && isNetworkSupported, hasSignMessage, isNetworkSupported };
};
