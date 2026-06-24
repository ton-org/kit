/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { UserFriendlyAddress } from '@ton/appkit';

import { useMinterStore } from '../minter-store';

export const setGaslessFeeAsset = (gaslessFeeAsset: UserFriendlyAddress | null): void => {
    useMinterStore.setState({ gaslessFeeAsset });
};
