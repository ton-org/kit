/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useSyncExternalStore, useCallback } from 'react';
import { getSignMessageSupport, watchSignMessageSupport } from '@ton/appkit';

import { useAppKit } from '../../settings';

export type UseSignMessageSupportReturnType = boolean;

/**
 * Hook to check whether the selected wallet advertises the `SignMessage`
 * feature (required for gasless). Reactive to wallet selection changes;
 * fail-closed (`false`) when no wallet is selected or features aren't
 * advertised — matching the gasless send path.
 */
export const useSignMessageSupport = (): UseSignMessageSupportReturnType => {
    const appKit = useAppKit();

    const subscribe = useCallback((onChange: () => void) => watchSignMessageSupport(appKit, { onChange }), [appKit]);

    const getSnapshot = useCallback(() => getSignMessageSupport(appKit), [appKit]);

    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};
