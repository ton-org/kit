/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useMinterStore } from '../minter-store';

/**
 * Turns the gasless mint flow on.
 *
 * The fee asset is seeded separately and reactively via {@link seedGaslessFeeAsset}
 * as the relayer config resolves — so the USDT default survives even when the
 * config hasn't loaded yet at the moment gasless is enabled (settings Save or the
 * low-balance "switch to gasless").
 *
 * Shared between the mint settings modal (Save) and the low-balance modal so both
 * call sites converge on the same behaviour.
 */
export const enableGasless = (): void => {
    useMinterStore.setState({ gaslessEnabled: true });
};
