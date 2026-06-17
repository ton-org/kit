/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { Feature } from '@tonconnect/protocol';

/** Wallet feature kinds that advertise a `maxMessages` cap. */
type MaxMessagesFeatureName = 'SendTransaction' | 'SignMessage';

/**
 * Maximum number of messages the wallet can handle for the given feature.
 * Defaults to the `SendTransaction` cap (used e.g. by the swap flow); pass
 * `'SignMessage'` for the gasless flow, whose cap lives on a different feature.
 * @param features - Array of wallet features from getSupportedFeatures()
 * @returns Maximum number of messages the wallet can handle (default: 1 when the
 *          feature is not advertised)
 */
export function getMaxOutgoingMessages(
    features: Feature[],
    featureName: MaxMessagesFeatureName = 'SendTransaction',
): number {
    const feature = features.find(
        (f): f is Extract<Feature, { name: MaxMessagesFeatureName }> => typeof f === 'object' && f.name === featureName,
    );

    return feature?.maxMessages ?? 1;
}
