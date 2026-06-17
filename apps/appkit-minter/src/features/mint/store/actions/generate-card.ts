/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { createRandomCard } from '../../lib/card-data';
import { useMinterStore } from '../minter-store';

export const generateCard = (): void => {
    useMinterStore.setState({ isGenerating: true, mintError: null });

    useMinterStore.setState({ currentCard: createRandomCard(), isGenerating: false });
};
