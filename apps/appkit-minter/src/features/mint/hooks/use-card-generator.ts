/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { generateCard } from '../store/actions/generate-card';
import { clearCard } from '../store/actions/clear-card';
import { useMinterStore } from '../store/minter-store';

export const useCardGenerator = () => {
    const currentCard = useMinterStore((state) => state.currentCard);
    const isGenerating = useMinterStore((state) => state.isGenerating);

    return { currentCard, isGenerating, generate: generateCard, clear: clearCard };
};
