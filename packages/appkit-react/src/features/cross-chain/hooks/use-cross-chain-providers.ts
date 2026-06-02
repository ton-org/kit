/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useSyncExternalStore, useCallback } from 'react';
import { getCrossChainProviders, watchCrossChainProviders } from '@ton/appkit';
import type { GetCrossChainProvidersReturnType } from '@ton/appkit';

import { useAppKit } from '../../settings';

export type UseCrossChainProvidersReturnType = GetCrossChainProvidersReturnType;

/**
 * Hook to get all registered cross-chain providers.
 */
export const useCrossChainProviders = (): UseCrossChainProvidersReturnType => {
    const appKit = useAppKit();

    const subscribe = useCallback(
        (onChange: () => void) => {
            return watchCrossChainProviders(appKit, { onChange });
        },
        [appKit],
    );

    const getSnapshot = useCallback(() => {
        return getCrossChainProviders(appKit);
    }, [appKit]);

    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};
