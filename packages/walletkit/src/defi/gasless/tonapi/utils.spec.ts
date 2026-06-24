/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { describe, it, expect } from 'vitest';
import { Address, beginCell, Cell, internal, storeMessageRelaxed, storeStateInit } from '@ton/core';

import type { Base64String, TransactionRequestMessage } from '../../../api/models';
import { GaslessError } from '../errors';
import { buildInternalMessageCell, cellToBase64, internalBocToExternalMessageBoc, stripHexPrefix } from './utils';

const TEST_ADDRESS = 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs';

const cellToBase64String = (cell: Cell): Base64String => cell.toBoc().toString('base64') as Base64String;

describe('stripHexPrefix', () => {
    it('removes 0x prefix when present', () => {
        expect(stripHexPrefix('0xabc')).toBe('abc');
    });

    it('returns input unchanged when no prefix', () => {
        expect(stripHexPrefix('abc')).toBe('abc');
    });

    it('handles empty string', () => {
        expect(stripHexPrefix('')).toBe('');
    });
});

describe('cellToBase64', () => {
    it('encodes an empty cell to base64 BoC', () => {
        const cell = beginCell().endCell();
        const encoded = cellToBase64(cell);
        const decoded = Cell.fromBase64(encoded);
        expect(decoded.equals(cell)).toBe(true);
    });
});

describe('buildInternalMessageCell', () => {
    it('builds a bounce=true internal message with payload', () => {
        const payload = beginCell().storeUint(42, 32).endCell();
        const message: TransactionRequestMessage = {
            address: TEST_ADDRESS,
            amount: '1000000000',
            payload: cellToBase64String(payload),
        };

        const cell = buildInternalMessageCell(message);
        const slice = cell.beginParse();

        // tag: 0 (internal message)
        expect(slice.loadBit()).toBe(false);
        // ihrDisabled
        expect(slice.loadBit()).toBe(true);
        // bounce flag should be true (gasless default for jetton transfers)
        expect(slice.loadBit()).toBe(true);
    });

    it('builds an internal message without payload (empty body)', () => {
        const message: TransactionRequestMessage = {
            address: TEST_ADDRESS,
            amount: '0',
        };

        const cell = buildInternalMessageCell(message);
        expect(cell.bits.length).toBeGreaterThan(0);
    });

    it('attaches stateInit when provided', () => {
        const code = beginCell().endCell();
        const data = beginCell().endCell();
        const stateInit = beginCell().store(storeStateInit({ code, data })).endCell();

        const message: TransactionRequestMessage = {
            address: TEST_ADDRESS,
            amount: '500000000',
            stateInit: cellToBase64String(stateInit),
        };

        const cell = buildInternalMessageCell(message);
        // sanity: should produce a valid cell
        expect(cell.bits.length).toBeGreaterThan(0);
    });
});

describe('internalBocToExternalMessageBoc', () => {
    const buildSignedInternalBoc = (): Base64String => {
        const body = beginCell().storeUint(1, 32).endCell();
        const msg = internal({
            to: Address.parse(TEST_ADDRESS),
            value: 0n,
            body,
            bounce: false,
        });
        const cell = beginCell().store(storeMessageRelaxed(msg)).endCell();
        return cellToBase64String(cell);
    };

    it('converts an internal-message BoC into an external-message BoC', () => {
        const internalBoc = buildSignedInternalBoc();
        const externalCell = internalBocToExternalMessageBoc(internalBoc);

        // The result should be parseable as an external message structure
        const slice = externalCell.beginParse();
        // external-in-msg tag (10 = 2 bits, '01')
        expect(slice.loadBit()).toBe(true);
        expect(slice.loadBit()).toBe(false);
    });

    it('throws when input cannot be parsed as a relaxed message', () => {
        const garbage = cellToBase64String(beginCell().storeUint(0xdead, 16).endCell());

        // The parse layer throws before we reach the GaslessError branch;
        // either way the conversion must not silently succeed.
        expect(() => internalBocToExternalMessageBoc(garbage)).toThrow();
    });
});

// Reference: GaslessError is exported but its instance is only thrown on the
// `info.type !== 'internal'` branch, which is unreachable without crafting a
// relaxed externalOut message (no builder for that in @ton/core). The branch
// is exercised indirectly via integration in TonApiGaslessProvider.spec.ts.
void GaslessError;
