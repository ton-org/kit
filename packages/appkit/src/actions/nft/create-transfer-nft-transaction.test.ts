/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { describe, it, expect } from 'vitest';
import { Address, beginCell, Cell } from '@ton/core';
import { DEFAULT_FORWARD_AMOUNT, DEFAULT_NFT_GAS_FEE } from '@ton/walletkit';

import { Network } from '../../types/network';
import type { AppKit } from '../../core/app-kit';
import type { WalletInterface } from '../../types/wallet';
import { asBase64 } from '../../utils';
import { createTransferNftTransaction } from './create-transfer-nft-transaction';

const SENDER = 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs';
const NEW_OWNER = 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c';
const NFT = 'EQDrjaLahLkMB-hMCmkzOyBuHJ139ZJpDQrN6JleegN-Y3X';

const makeWallet = (): WalletInterface =>
    ({
        getAddress: () => SENDER,
        getNetwork: () => Network.mainnet(),
    }) as unknown as WalletInterface;

const makeAppKit = (wallet: WalletInterface | null): AppKit =>
    ({ walletsManager: { selectedWallet: wallet } }) as unknown as AppKit;

interface DecodedNftBody {
    queryId: bigint;
    newOwner: Address;
    responseDestination: Address;
    customPayload: Cell | null;
    forwardAmount: bigint;
    forwardPayload: Cell | null;
}

const decodeNftBody = (payload: string | undefined): DecodedNftBody => {
    if (!payload) throw new Error('expected payload');
    const slice = Cell.fromBase64(payload).beginParse();
    slice.loadUint(32); // nft transfer op
    return {
        queryId: slice.loadUintBig(64),
        newOwner: slice.loadAddress(),
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

describe('createTransferNftTransaction', () => {
    it('builds a transfer with sensible defaults', async () => {
        const tx = await createTransferNftTransaction(makeAppKit(makeWallet()), {
            nftAddress: NFT,
            recipientAddress: NEW_OWNER,
        });

        expect(tx.messages[0].address).toBe(NFT);
        expect(tx.messages[0].amount).toBe(DEFAULT_NFT_GAS_FEE);
        expect(tx.fromAddress).toBe(SENDER);

        const body = decodeNftBody(tx.messages[0].payload);
        expect(body.queryId).toBe(0n);
        expect(body.newOwner.equals(Address.parse(NEW_OWNER))).toBe(true);
        expect(body.responseDestination.equals(Address.parse(SENDER))).toBe(true);
        expect(body.customPayload).toBeNull();
        expect(body.forwardAmount).toBe(DEFAULT_FORWARD_AMOUNT);
        expect(body.forwardPayload).toBeNull();
    });

    it('encodes a comment into the forward payload', async () => {
        const tx = await createTransferNftTransaction(makeAppKit(makeWallet()), {
            nftAddress: NFT,
            recipientAddress: NEW_OWNER,
            comment: 'enjoy',
        });

        expect(readComment(decodeNftBody(tx.messages[0].payload).forwardPayload)).toBe('enjoy');
    });

    it('prefers a raw forwardPayload over a comment', async () => {
        const forward = beginCell().storeUint(0xdeadbeef, 32).endCell();

        const tx = await createTransferNftTransaction(makeAppKit(makeWallet()), {
            nftAddress: NFT,
            recipientAddress: NEW_OWNER,
            comment: 'ignored',
            forwardPayload: asBase64(forward.toBoc().toString('base64')),
        });

        expect(sameCell(decodeNftBody(tx.messages[0].payload).forwardPayload, forward)).toBe(true);
    });

    it('forwards queryId, forwardAmount, customPayload, responseDestination and gas amount', async () => {
        const customPayload = beginCell().storeUint(0xaa, 8).endCell();

        const tx = await createTransferNftTransaction(makeAppKit(makeWallet()), {
            nftAddress: NFT,
            recipientAddress: NEW_OWNER,
            gasAmount: '250000000',
            responseDestination: NEW_OWNER,
            queryId: '42',
            forwardAmount: '5000000',
            customPayload: asBase64(customPayload.toBoc().toString('base64')),
        });

        expect(tx.messages[0].amount).toBe('250000000');

        const body = decodeNftBody(tx.messages[0].payload);
        expect(body.queryId).toBe(42n);
        expect(body.forwardAmount).toBe(5000000n);
        expect(body.responseDestination.equals(Address.parse(NEW_OWNER))).toBe(true);
        expect(sameCell(body.customPayload, customPayload)).toBe(true);
    });

    it('throws when no wallet is connected', async () => {
        await expect(
            createTransferNftTransaction(makeAppKit(null), { nftAddress: NFT, recipientAddress: NEW_OWNER }),
        ).rejects.toThrow('Wallet not connected');
    });
});
