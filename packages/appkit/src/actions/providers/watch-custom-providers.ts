/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { AppKit } from '../../core/app-kit';

export interface WatchCustomProvidersParameters {
    onChange: () => void;
}

export type WatchCustomProvidersReturnType = () => void;

/**
 * Watch for custom provider registrations
 */
export const watchCustomProviders = (
    appKit: AppKit,
    parameters: WatchCustomProvidersParameters,
): WatchCustomProvidersReturnType => {
    const { onChange } = parameters;

    return appKit.emitter.on('provider:registered', (event) => {
        if (event.payload.type === 'custom') onChange();
    });
};
