/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { Jetton } from '@ton/walletkit';

/** The asset the user is sending — TON, or a specific jetton. */
export interface SelectedToken {
    type: 'TON' | 'JETTON';
    data?: Jetton;
}

/** View-model for one selectable send asset (TON or a held jetton). */
export interface TokenOption {
    token: SelectedToken;
    /** `'TON'` or the jetton address — also the selection key. */
    id: string;
    icon?: string;
    fallbackText: string;
    name: string;
    symbol: string;
    decimals: number;
    /** Held balance in whole tokens. */
    balance: number;
    /** Largest sendable amount (balance minus the gas reserve for TON). */
    maxSendable: number;
    /** USD price per token; omitted when there's no rate. */
    rate?: number;
}
