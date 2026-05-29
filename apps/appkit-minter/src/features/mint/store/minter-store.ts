/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { create } from 'zustand';

import { createRandomCard } from '../lib/card-data';
import type { CardData } from '../types/card';

interface MinterState {
    currentCard: CardData | null;
    mintedCards: CardData[];
    isGenerating: boolean;
    isMinting: boolean;
    mintError: string | null;
}

export const useMinterStore = create<MinterState>(() => ({
    currentCard: createRandomCard(),
    mintedCards: [],
    isGenerating: false,
    isMinting: false,
    mintError: null,
}));
