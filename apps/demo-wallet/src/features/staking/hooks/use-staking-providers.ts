/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useMemo } from 'react';
import { useWalletKit } from '@demo/wallet-core';

export interface StakingProviderOption {
    id: string;
    name: string;
}

/** Registered staking providers (id + display name) read from the kit. */
export const useStakingProviders = (): StakingProviderOption[] => {
    const walletKit = useWalletKit();

    return useMemo(() => {
        if (!walletKit) return [];
        return walletKit.staking.getProviders().map((provider) => ({
            id: provider.providerId,
            name: provider.getStakingProviderMetadata().name,
        }));
    }, [walletKit]);
};
