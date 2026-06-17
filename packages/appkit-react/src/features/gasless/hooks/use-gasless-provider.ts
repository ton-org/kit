/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use client';

import { useSyncExternalStore, useCallback } from 'react';
import { getGaslessProvider, setDefaultGaslessProvider, watchGaslessProviders } from '@ton/appkit';
import type { GetGaslessProviderReturnType } from '@ton/appkit';

import { useAppKit } from '../../settings/hooks/use-app-kit';

export type UseGaslessProviderReturnType = readonly [
    GetGaslessProviderReturnType | undefined,
    (providerId: string) => void,
];

/**
 * Hook to get and set the currently selected gasless provider.
 * Mirrors the tuple shape of `useSwapProvider`.
 */
export const useGaslessProvider = (): UseGaslessProviderReturnType => {
    const appKit = useAppKit();

    const subscribe = useCallback(
        (onChange: () => void) => {
            return watchGaslessProviders(appKit, { onChange });
        },
        [appKit],
    );

    const getSnapshot = useCallback(() => {
        try {
            return getGaslessProvider(appKit);
        } catch {
            return undefined;
        }
    }, [appKit]);

    const provider = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

    const setProviderId = useCallback(
        (providerId: string) => {
            setDefaultGaslessProvider(appKit, { providerId });
        },
        [appKit],
    );

    return [provider, setProviderId] as const;
};
