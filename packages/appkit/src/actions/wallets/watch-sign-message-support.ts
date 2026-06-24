/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { AppKit } from '../../core/app-kit';
import { WALLETS_EVENTS } from '../../core/app-kit';
import { getSignMessageSupport } from './get-sign-message-support';

export interface WatchSignMessageSupportParameters {
    onChange: (supported: boolean) => void;
}

export type WatchSignMessageSupportReturnType = () => void;

/**
 * Watch whether the selected wallet supports `SignMessage`. Re-evaluated on
 * every wallet selection change (features are static per wallet, so the
 * selection change is the only thing that can flip the result).
 */
export const watchSignMessageSupport = (
    appKit: AppKit,
    parameters: WatchSignMessageSupportParameters,
): WatchSignMessageSupportReturnType => {
    const { onChange } = parameters;

    const unsubscribe = appKit.emitter.on(WALLETS_EVENTS.SELECTION_CHANGED, () => {
        onChange(getSignMessageSupport(appKit));
    });

    return unsubscribe;
};
