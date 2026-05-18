/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useSyncExternalStore, useCallback } from 'react';
import { getCryptoOnrampProvider, setDefaultCryptoOnrampProvider, watchCryptoOnrampProviders } from '@ton/appkit';
import type { GetCryptoOnrampProviderReturnType } from '@ton/appkit';

import { useAppKit } from '../../settings/hooks/use-app-kit';

export type UseCryptoOnrampProviderReturnType = readonly [
    GetCryptoOnrampProviderReturnType | undefined,
    (providerId: string) => void,
];

/**
 * Hook to get and set the currently selected crypto-onramp provider.
 * Mirrors the tuple shape of `useSwapProvider`.
 */
export const useCryptoOnrampProvider = (): UseCryptoOnrampProviderReturnType => {
    const appKit = useAppKit();

    const subscribe = useCallback(
        (onChange: () => void) => {
            return watchCryptoOnrampProviders(appKit, { onChange });
        },
        [appKit],
    );

    const getSnapshot = useCallback(() => {
        try {
            return getCryptoOnrampProvider(appKit);
        } catch {
            return undefined;
        }
    }, [appKit]);

    const provider = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

    const setProviderId = useCallback(
        (providerId: string) => {
            setDefaultCryptoOnrampProvider(appKit, { providerId });
        },
        [appKit],
    );

    return [provider, setProviderId] as const;
};
