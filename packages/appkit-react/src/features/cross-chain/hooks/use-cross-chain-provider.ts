/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useSyncExternalStore, useCallback } from 'react';
import { getCrossChainProvider, watchCrossChainProviders } from '@ton/appkit';
import type { GetCrossChainProviderOptions, GetCrossChainProviderReturnType } from '@ton/appkit';

import { useAppKit } from '../../settings';

export type UseCrossChainProviderReturnType = GetCrossChainProviderReturnType;

/**
 * Hook to get cross-chain provider
 */
export const useCrossChainProvider = (
    options: GetCrossChainProviderOptions,
): UseCrossChainProviderReturnType | undefined => {
    const appKit = useAppKit();
    const { id } = options;

    const subscribe = useCallback(
        (onChange: () => void) => {
            return watchCrossChainProviders(appKit, { onChange });
        },
        [appKit],
    );

    const getSnapshot = useCallback(() => {
        try {
            return getCrossChainProvider(appKit, { id });
        } catch {
            return undefined;
        }
    }, [appKit, id]);

    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};
