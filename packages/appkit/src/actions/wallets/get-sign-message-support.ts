/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { AppKit } from '../../core/app-kit';
import { hasSignMessageSupport } from '../../utils';
import { getSelectedWallet } from './get-selected-wallet';

export type GetSignMessageSupportReturnType = boolean;

/**
 * Whether the currently selected wallet advertises the `SignMessage` feature
 * (required for gasless transactions).
 *
 * Fail-closed: returns `false` when no wallet is selected or the wallet
 * advertises no features. This mirrors the gasless send path, which rejects a
 * `SignMessage` request from a wallet that doesn't list the feature — so the UI
 * should not offer gasless when the send would refuse it.
 */
export const getSignMessageSupport = (appKit: AppKit): GetSignMessageSupportReturnType => {
    const features = getSelectedWallet(appKit)?.getSupportedFeatures();
    return features ? hasSignMessageSupport(features) : false;
};
