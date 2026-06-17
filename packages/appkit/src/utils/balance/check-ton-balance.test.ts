/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { describe, expect, it } from 'vitest';

import { checkTonBalance } from './check-ton-balance';

/** 0.01 TON in nanos — a reasonable buffer for unit tests. */
const BUFFER = 10_000_000n;

const msg = (amountNanos: bigint) => ({ amount: amountNanos.toString() });

describe('checkTonBalance', () => {
    describe('balance is sufficient', () => {
        it('returns undefined when balance exceeds outflow + buffer', () => {
            const result = checkTonBalance({
                messages: [msg(50_000_000n)], // 0.05 TON outflow
                tonBalance: '1', // 1 TON
                gasBufferNanos: BUFFER,
            });
            expect(result).toBeUndefined();
        });

        it('returns undefined when balance equals exactly (required = balance)', () => {
            const result = checkTonBalance({
                messages: [msg(50_000_000n)], // 0.05 TON
                tonBalance: '0.06', // 0.06 TON = 0.05 + 0.01 buffer
                gasBufferNanos: BUFFER,
            });
            expect(result).toBeUndefined();
        });

        it('returns undefined for an empty messages array when balance covers buffer', () => {
            const result = checkTonBalance({
                messages: [],
                tonBalance: '0.01',
                gasBufferNanos: BUFFER,
            });
            expect(result).toBeUndefined();
        });
    });

    describe('balance is insufficient', () => {
        it('returns shortfall when balance is below required', () => {
            const result = checkTonBalance({
                messages: [msg(50_000_000n)],
                tonBalance: '0.05', // 0.05 TON — exactly outflow, but no headroom for buffer
                gasBufferNanos: BUFFER,
            });
            expect(result).toEqual({ requiredNanos: 60_000_000n });
        });

        it('returns shortfall when balance is zero', () => {
            const result = checkTonBalance({
                messages: [msg(1_000_000n)], // 0.001 TON deploy
                tonBalance: '0',
                gasBufferNanos: BUFFER,
            });
            expect(result).toEqual({ requiredNanos: 11_000_000n });
        });

        it('sums multiple message outflows', () => {
            const result = checkTonBalance({
                messages: [msg(50_000_000n), msg(30_000_000n), msg(10_000_000n)],
                tonBalance: '0.05',
                gasBufferNanos: BUFFER,
            });
            expect(result).toEqual({ requiredNanos: 50_000_000n + 30_000_000n + 10_000_000n + BUFFER });
        });

        it('respects a smaller gasBufferNanos override', () => {
            const result = checkTonBalance({
                messages: [msg(50_000_000n)],
                tonBalance: '0.05',
                gasBufferNanos: 1_000_000n, // 0.001 TON buffer
            });
            expect(result).toEqual({ requiredNanos: 51_000_000n });
        });

        it('triggers on a 1-nano deficit (boundary)', () => {
            const result = checkTonBalance({
                messages: [msg(50_000_000n)],
                tonBalance: '0.059999999', // 1 nano short of 0.06 = 50_000_000 + 10_000_000 buffer
                gasBufferNanos: BUFFER,
            });
            expect(result).toEqual({ requiredNanos: 60_000_000n });
        });
    });

    describe('unloaded balance', () => {
        it('returns undefined when tonBalance is undefined (not yet loaded)', () => {
            const result = checkTonBalance({
                messages: [msg(50_000_000n)],
                tonBalance: undefined,
                gasBufferNanos: BUFFER,
            });
            expect(result).toBeUndefined();
        });

        it('treats undefined as "unknown", not as zero — no false-positive shortfall', () => {
            // If `undefined` were treated as 0n, a user with insufficient balance would already
            // see a shortfall flash on first render before their real balance loads.
            const result = checkTonBalance({
                messages: [msg(1_000_000_000n)],
                tonBalance: undefined,
                gasBufferNanos: BUFFER,
            });
            expect(result).toBeUndefined();
        });
    });

    describe('precision', () => {
        it('handles bigint values larger than Number.MAX_SAFE_INTEGER', () => {
            const huge = 1_000_000_000_000_000_000n; // 1 quintillion nanos = 1 billion TON
            const result = checkTonBalance({
                messages: [msg(huge)],
                tonBalance: '0',
                gasBufferNanos: BUFFER,
            });
            expect(result).toEqual({ requiredNanos: huge + BUFFER });
        });
    });
});
