/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { describe, it, expect } from 'vitest';
import { beginCell, Cell } from '@ton/core';

import { Network } from '../../types/network';
import type { AppKit } from '../../core/app-kit';
import type { WalletInterface } from '../../types/wallet';
import { asBase64 } from '../../utils';
import { createTransferTonTransaction } from './create-transfer-ton-transaction';

const SENDER = 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs';
const RECIPIENT = 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c';

const makeWallet = (): WalletInterface =>
    ({
        getAddress: () => SENDER,
        getNetwork: () => Network.mainnet(),
    }) as unknown as WalletInterface;

const makeAppKit = (wallet: WalletInterface | null): AppKit =>
    ({ walletsManager: { selectedWallet: wallet } }) as unknown as AppKit;

const readComment = (payload: string | undefined): string => {
    if (!payload) throw new Error('expected payload');
    const slice = Cell.fromBase64(payload).beginParse();
    slice.loadUint(32); // text comment op = 0
    return slice.loadStringTail();
};

describe('createTransferTonTransaction', () => {
    it('builds a single message with the amount converted to nanotons', () => {
        const tx = createTransferTonTransaction(makeAppKit(makeWallet()), {
            recipientAddress: RECIPIENT,
            amount: '1.5',
        });

        expect(tx.messages).toHaveLength(1);
        expect(tx.messages[0].address).toBe(RECIPIENT);
        expect(tx.messages[0].amount).toBe('1500000000');
        expect(tx.fromAddress).toBe(SENDER);
    });

    it('encodes a comment into the payload when no raw payload is given', () => {
        const tx = createTransferTonTransaction(makeAppKit(makeWallet()), {
            recipientAddress: RECIPIENT,
            amount: '1',
            comment: 'gm',
        });

        expect(readComment(tx.messages[0].payload)).toBe('gm');
    });

    it('prefers a raw payload over a comment', () => {
        const rawPayload = asBase64(beginCell().storeUint(0x1234, 32).endCell().toBoc().toString('base64'));

        const tx = createTransferTonTransaction(makeAppKit(makeWallet()), {
            recipientAddress: RECIPIENT,
            amount: '1',
            comment: 'ignored',
            payload: rawPayload,
        });

        expect(tx.messages[0].payload).toBe(rawPayload);
    });

    it('forwards stateInit and extraCurrency onto the message', () => {
        const stateInit = asBase64(beginCell().storeUint(1, 8).endCell().toBoc().toString('base64'));
        const extraCurrency = { '100': '5' };

        const tx = createTransferTonTransaction(makeAppKit(makeWallet()), {
            recipientAddress: RECIPIENT,
            amount: '1',
            stateInit,
            extraCurrency,
        });

        expect(tx.messages[0].stateInit).toBe(stateInit);
        expect(tx.messages[0].extraCurrency).toEqual(extraCurrency);
    });

    it('throws when no wallet is connected', () => {
        expect(() =>
            createTransferTonTransaction(makeAppKit(null), { recipientAddress: RECIPIENT, amount: '1' }),
        ).toThrow('Wallet not connected');
    });
});
