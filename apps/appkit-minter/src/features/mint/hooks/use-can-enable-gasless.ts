/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useMemo } from 'react';
import { useNetwork, useSelectedWallet } from '@ton/appkit-react';

import { getMintForwardAddress } from '../constants';

/**
 * Whether the gasless mint flow is usable right now:
 * - the connected wallet advertises the `SignMessage` feature, AND
 * - the current network has a deployed `MintForward` forwarder address.
 *
 * Returns `false` when no wallet is connected.
 */
export const useCanEnableGasless = (): boolean => {
    const [wallet] = useSelectedWallet();
    const network = useNetwork();

    const supportsSignMessage = useMemo(() => {
        const features = wallet?.getSupportedFeatures();
        if (features === undefined) return false;
        return features.some((feature) => typeof feature === 'object' && feature.name === 'SignMessage');
    }, [wallet]);

    const isNetworkSupported = network ? !!getMintForwardAddress(network.chainId) : false;

    return supportsSignMessage && isNetworkSupported;
};
