/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { create } from 'zustand';
import type { UserFriendlyAddress } from '@ton/appkit';

import { createRandomCard } from '../lib/card-data';
import type { CardData } from '../types/card';

interface MinterState {
    currentCard: CardData | null;
    mintedCards: CardData[];
    isGenerating: boolean;
    isMinting: boolean;
    mintError: string | null;
    /** When true, the mint flow routes through TonAPI gasless via MintForward. */
    gaslessEnabled: boolean;
    /**
     * Fee asset the relayer charges its commission in. Persists across mints so the
     * user's last choice is remembered when re-enabling gasless. `null` only on
     * first run, before the user has ever opened mint settings.
     */
    gaslessFeeAsset: UserFriendlyAddress | null;
}

export const useMinterStore = create<MinterState>(() => ({
    currentCard: createRandomCard(),
    mintedCards: [],
    isGenerating: false,
    isMinting: false,
    mintError: null,
    gaslessEnabled: false,
    gaslessFeeAsset: null,
}));
