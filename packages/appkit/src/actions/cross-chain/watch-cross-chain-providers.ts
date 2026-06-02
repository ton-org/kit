/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { AppKit } from '../../core/app-kit';

export interface WatchCrossChainProvidersParameters {
    onChange: () => void;
}

export type WatchCrossChainProvidersReturnType = () => void;

/**
 * Watch for new cross-chain providers registration
 */
export const watchCrossChainProviders = (
    appKit: AppKit,
    parameters: WatchCrossChainProvidersParameters,
): WatchCrossChainProvidersReturnType => {
    const { onChange } = parameters;

    const unsubscribeRegistered = appKit.emitter.on('provider:registered', (event) => {
        if (event.payload.type === 'cross-chain') onChange();
    });

    return () => {
        unsubscribeRegistered();
    };
};
