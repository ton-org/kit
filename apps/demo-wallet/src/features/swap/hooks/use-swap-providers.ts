/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useMemo } from 'react';
import { useWalletKit } from '@demo/wallet-core';

export interface SwapProviderOption {
    id: string;
    name: string;
    logo?: string;
    url?: string;
}

/** Registered swap providers (id + display metadata) read from the kit. */
export const useSwapProviders = (): SwapProviderOption[] => {
    const walletKit = useWalletKit();

    return useMemo(() => {
        if (!walletKit) return [];
        return walletKit.swap.getProviders().map((provider) => ({
            id: provider.providerId,
            ...provider.getMetadata(),
        }));
    }, [walletKit]);
};
