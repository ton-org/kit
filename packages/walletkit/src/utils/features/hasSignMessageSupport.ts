/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { Feature, SignMessageFeature } from '@tonconnect/protocol';

/** Find the wallet's advertised `SignMessage` feature, if any. */
function findSignMessageFeature(features: Feature[]): SignMessageFeature | undefined {
    return features.find(
        (feature): feature is SignMessageFeature =>
            !!feature && typeof feature === 'object' && feature.name === 'SignMessage',
    );
}

/** Whether the connected wallet advertises the `SignMessage` feature. */
export function hasSignMessageSupport(features: Feature[]): boolean {
    return findSignMessageFeature(features) !== undefined;
}
