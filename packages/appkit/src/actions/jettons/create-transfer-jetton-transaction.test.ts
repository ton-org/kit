/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Address, beginCell, Cell } from '@ton/core';
import * as walletkit from '@ton/walletkit';

import { Network } from '../../types/network';
import type { AppKit } from '../../core/app-kit';
import type { WalletInterface } from '../../types/wallet';
import { asBase64 } from '../../utils';
import { createTransferJettonTransaction } from './create-transfer-jetton-transaction';

const SENDER = 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs';
const RECIPIENT = 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c';
const JETTON = 'EQDrjaLahLkMB-hMCmkzOyBuHJ139ZJpDQrN6JleegN-Y3X';
const JETTON_WALLET = 'EQDrjaLahLkMB-hMCmkzOyBuHJ139ZJpDQrN6JleegN-Y3X';

vi.mock('@ton/walletkit', async (importOriginal) => {
    const actual = await importOriginal<typeof walletkit>();
    return {
        ...actual,
        getJettonWalletAddressFromClient: vi.fn(),
    };
});

const makeWallet = (): WalletInterface =>
    ({
        getAddress: () => SENDER,
        getNetwork: () => Network.mainnet(),
    }) as unknown as WalletInterface;

const makeAppKit = (wallet: WalletInterface | null): AppKit =>
    ({
        walletsManager: { selectedWallet: wallet },
        networkManager: { getClient: vi.fn().mockReturnValue({}) },
    }) as unknown as AppKit;

interface DecodedJettonBody {
    queryId: bigint;
    amount: bigint;
    destination: Address;
    responseDestination: Address;
    customPayload: Cell | null;
    forwardAmount: bigint;
    forwardPayload: Cell | null;
}

const decodeJettonBody = (payload: string | undefined): DecodedJettonBody => {
    if (!payload) throw new Error('expected payload');
    const slice = Cell.fromBase64(payload).beginParse();
    slice.loadUint(32); // jetton transfer op
    return {
        queryId: slice.loadUintBig(64),
        amount: slice.loadCoins(),
        destination: slice.loadAddress(),
        responseDestination: slice.loadAddress(),
        customPayload: slice.loadMaybeRef(),
        forwardAmount: slice.loadCoins(),
        forwardPayload: slice.loadMaybeRef(),
    };
};

const readComment = (cell: Cell | null): string => {
    if (!cell) throw new Error('expected comment payload');
    const slice = cell.beginParse();
    slice.loadUint(32);
    return slice.loadStringTail();
};

const sameCell = (a: Cell | null, b: Cell): boolean =>
    a !== null && a.toBoc().toString('base64') === b.toBoc().toString('base64');

describe('createTransferJettonTransaction', () => {
    beforeEach(() => {
        vi.mocked(walletkit.getJettonWalletAddressFromClient).mockResolvedValue(JETTON_WALLET);
    });

    it('targets the resolved jetton wallet and converts the amount by decimals', async () => {
        const tx = await createTransferJettonTransaction(makeAppKit(makeWallet()), {
            jettonAddress: JETTON,
            recipientAddress: RECIPIENT,
            amount: '2',
            jettonDecimals: 6,
        });

        expect(tx.messages[0].address).toBe(JETTON_WALLET);
        expect(tx.messages[0].amount).toBe(walletkit.DEFAULT_JETTON_GAS_FEE);
        expect(tx.fromAddress).toBe(SENDER);

        const body = decodeJettonBody(tx.messages[0].payload);
        expect(body.amount).toBe(2_000_000n);
        expect(body.destination.equals(Address.parse(RECIPIENT))).toBe(true);
        expect(body.responseDestination.equals(Address.parse(SENDER))).toBe(true);
        expect(body.queryId).toBe(0n);
        expect(body.forwardAmount).toBe(walletkit.DEFAULT_FORWARD_AMOUNT);
        expect(body.customPayload).toBeNull();
        expect(body.forwardPayload).toBeNull();
    });

    it('encodes a comment into the forward payload', async () => {
        const tx = await createTransferJettonTransaction(makeAppKit(makeWallet()), {
            jettonAddress: JETTON,
            recipientAddress: RECIPIENT,
            amount: '1',
            jettonDecimals: 9,
            comment: 'thanks',
        });

        expect(readComment(decodeJettonBody(tx.messages[0].payload).forwardPayload)).toBe('thanks');
    });

    it('prefers a raw forwardPayload over a comment', async () => {
        const forward = beginCell().storeUint(0xdeadbeef, 32).endCell();

        const tx = await createTransferJettonTransaction(makeAppKit(makeWallet()), {
            jettonAddress: JETTON,
            recipientAddress: RECIPIENT,
            amount: '1',
            jettonDecimals: 9,
            comment: 'ignored',
            forwardPayload: asBase64(forward.toBoc().toString('base64')),
        });

        expect(sameCell(decodeJettonBody(tx.messages[0].payload).forwardPayload, forward)).toBe(true);
    });

    it('forwards queryId, forwardAmount, customPayload, responseDestination and gasAmount', async () => {
        const customPayload = beginCell().storeUint(0xaa, 8).endCell();

        const tx = await createTransferJettonTransaction(makeAppKit(makeWallet()), {
            jettonAddress: JETTON,
            recipientAddress: RECIPIENT,
            amount: '1',
            jettonDecimals: 9,
            responseDestination: RECIPIENT,
            queryId: '7',
            forwardAmount: '300000000',
            customPayload: asBase64(customPayload.toBoc().toString('base64')),
            gasAmount: '150000000',
        });

        expect(tx.messages[0].amount).toBe('150000000');

        const body = decodeJettonBody(tx.messages[0].payload);
        expect(body.queryId).toBe(7n);
        expect(body.forwardAmount).toBe(300000000n);
        expect(body.responseDestination.equals(Address.parse(RECIPIENT))).toBe(true);
        expect(sameCell(body.customPayload, customPayload)).toBe(true);
    });

    it('throws when no wallet is connected', async () => {
        await expect(
            createTransferJettonTransaction(makeAppKit(null), {
                jettonAddress: JETTON,
                recipientAddress: RECIPIENT,
                amount: '1',
                jettonDecimals: 9,
            }),
        ).rejects.toThrow('Wallet not connected');
    });
});
