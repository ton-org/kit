/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useSyncExternalStore, useCallback } from 'react';
import { getCustomProvider, watchCustomProviders } from '@ton/appkit';
import type { CustomProvider } from '@ton/appkit';

import { useAppKit } from '../../settings/hooks/use-app-kit';

/**
 * Hook to get a registered custom provider by id. Pass the expected type as a
 * generic argument to narrow the returned provider. Reactive to custom provider
 * registrations.
 */
export const useCustomProvider = <T extends CustomProvider = CustomProvider>(id: string): T | undefined => {
    const appKit = useAppKit();

    const subscribe = useCallback(
        (onChange: () => void) => {
            return watchCustomProviders(appKit, { onChange });
        },
        [appKit],
    );

    const getSnapshot = useCallback(() => {
        return getCustomProvider<T>(appKit, { id });
    }, [appKit, id]);

    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};
