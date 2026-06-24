/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { AppKit } from '../../core/app-kit';

export interface WatchGaslessProvidersParameters {
    onChange: () => void;
}

export type WatchGaslessProvidersReturnType = () => void;

/**
 * Watch for new gasless providers registration and default-provider changes.
 */
export const watchGaslessProviders = (
    appKit: AppKit,
    parameters: WatchGaslessProvidersParameters,
): WatchGaslessProvidersReturnType => {
    const { onChange } = parameters;

    const unsubscribeRegistered = appKit.emitter.on('provider:registered', (event) => {
        if (event.payload.type === 'gasless') onChange();
    });

    const unsubscribeDefaultChanged = appKit.emitter.on('provider:default-changed', (event) => {
        if (event.payload.type === 'gasless') onChange();
    });

    return () => {
        unsubscribeRegistered();
        unsubscribeDefaultChanged();
    };
};
