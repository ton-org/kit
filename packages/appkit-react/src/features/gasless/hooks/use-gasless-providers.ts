/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use client';

import { useSyncExternalStore, useCallback } from 'react';
import { getGaslessProviders, watchGaslessProviders } from '@ton/appkit';
import type { GetGaslessProvidersReturnType } from '@ton/appkit';

import { useAppKit } from '../../settings/hooks/use-app-kit';

export type UseGaslessProvidersReturnType = GetGaslessProvidersReturnType;

/**
 * Hook to get all registered gasless providers.
 */
export const useGaslessProviders = (): UseGaslessProvidersReturnType => {
    const appKit = useAppKit();

    const subscribe = useCallback(
        (onChange: () => void) => {
            return watchGaslessProviders(appKit, { onChange });
        },
        [appKit],
    );

    const getSnapshot = useCallback(() => {
        return getGaslessProviders(appKit);
    }, [appKit]);

    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};
