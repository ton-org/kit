/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { describe, expect, it } from 'vitest';

import { checkTransferBalance } from './check-transfer-balance';

const BUFFER = 10_000_000n; // 0.01 TON
const TON = { address: 'ton' };
const JETTON = { address: 'EQA_jetton_master' };

const msg = (amountNanos: bigint) => ({ amount: amountNanos.toString() });

describe('checkTransferBalance', () => {
    describe('balance is sufficient', () => {
        it('returns undefined regardless of fromToken', () => {
            expect(
                checkTransferBalance({
                    messages: [msg(50_000_000n)],
                    tonBalance: '1',
                    gasBufferNanos: BUFFER,
                    fromToken: TON,
                    fromAmount: '0.04',
                }),
            ).toBeUndefined();
            expect(
                checkTransferBalance({
                    messages: [msg(50_000_000n)],
                    tonBalance: '1',
                    gasBufferNanos: BUFFER,
                    fromToken: JETTON,
                    fromAmount: '100',
                }),
            ).toBeUndefined();
        });

        it('returns undefined when balance is unloaded', () => {
            const result = checkTransferBalance({
                messages: [msg(50_000_000n)],
                tonBalance: undefined,
                gasBufferNanos: BUFFER,
                fromToken: TON,
                fromAmount: '0.04',
            });
            expect(result).toBeUndefined();
        });
    });

    describe('jetton outflow — always topup', () => {
        it('returns topup when jetton-from has insufficient TON for gas', () => {
            const result = checkTransferBalance({
                messages: [msg(50_000_000n)], // 0.05 TON jetton-transfer gas
                tonBalance: '0.02',
                gasBufferNanos: BUFFER,
                fromToken: JETTON,
                fromAmount: '100',
            });
            expect(result).toEqual({ mode: 'topup', requiredNanos: 60_000_000n });
        });

        it('returns topup even when balance is zero', () => {
            const result = checkTransferBalance({
                messages: [msg(1_000_000n)],
                tonBalance: '0',
                gasBufferNanos: BUFFER,
                fromToken: JETTON,
                fromAmount: '50',
            });
            expect(result).toEqual({ mode: 'topup', requiredNanos: 11_000_000n });
        });

        it('does not consider safetyMarginNanos for jetton outflow', () => {
            // safetyMarginNanos only matters in the reduce calculation — jetton can't reduce.
            const result = checkTransferBalance({
                messages: [msg(50_000_000n)],
                tonBalance: '0.02',
                gasBufferNanos: BUFFER,
                fromToken: JETTON,
                fromAmount: '100',
                safetyMarginNanos: 1_000_000_000n, // 1 TON — would be huge if applied
            });
            expect(result).toEqual({ mode: 'topup', requiredNanos: 60_000_000n });
        });
    });

    describe('TON outflow — reduce when gas fits', () => {
        it('returns reduce with a smaller suggestedFromAmount when balance covers gas', () => {
            // total_out = fromAmount + gas. User has enough for gas + buffer + safety, but
            // not for full fromAmount. Suggest reduced amount.
            const fromAmountNanos = 500_000_000n; // 0.5 TON intended spend
            const gasOnlyNanos = 50_000_000n; // 0.05 TON gas attached to other messages
            const tonBalance = '0.4'; // can't afford 0.5 spend, but enough for gas + margin

            const result = checkTransferBalance({
                messages: [msg(fromAmountNanos + gasOnlyNanos)],
                tonBalance,
                gasBufferNanos: BUFFER,
                fromToken: TON,
                fromAmount: '0.5',
            });

            // suggested = balance - gasOnly - gasBuffer - safetyMargin
            // = 400_000_000 - 50_000_000 - 10_000_000 - 20_000_000 = 320_000_000n = 0.32 TON
            expect(result).toEqual({
                mode: 'reduce',
                requiredNanos: fromAmountNanos + gasOnlyNanos + BUFFER,
                suggestedFromAmount: '0.32',
            });
        });

        it('returns topup when even gas does not fit', () => {
            // Balance below gasOnly + buffer + safetyMargin → reducing won't help.
            const result = checkTransferBalance({
                messages: [msg(500_000_000n)], // 0.5 TON total outflow
                tonBalance: '0.001', // way too low for any meaningful gas
                gasBufferNanos: BUFFER,
                fromToken: TON,
                fromAmount: '0.4',
            });
            expect(result?.mode).toBe('topup');
            expect(result?.requiredNanos).toBe(510_000_000n);
        });

        it('boundary: balance equals nonSpendReserved exactly → topup', () => {
            // tonBalance <= nonSpendReserved should return topup (cannot leave anything to spend).
            const gasOnly = 50_000_000n;
            const fromAmount = 100_000_000n;
            // nonSpendReserved = gasOnly + BUFFER + DEFAULT_SAFETY_MARGIN_NANOS = 80_000_000n
            const balanceAtBoundary = '0.08';

            const result = checkTransferBalance({
                messages: [msg(gasOnly + fromAmount)],
                tonBalance: balanceAtBoundary,
                gasBufferNanos: BUFFER,
                fromToken: TON,
                fromAmount: '0.1',
            });

            expect(result?.mode).toBe('topup');
        });

        it('boundary: 1-nano above nonSpendReserved → reduce', () => {
            const gasOnly = 50_000_000n;
            const fromAmount = 100_000_000n;
            // nonSpendReserved = gasOnly + BUFFER + DEFAULT_SAFETY_MARGIN_NANOS = 80_000_000n

            const result = checkTransferBalance({
                messages: [msg(gasOnly + fromAmount)],
                tonBalance: '0.080000001', // 1 nano above the boundary
                gasBufferNanos: BUFFER,
                fromToken: TON,
                fromAmount: '0.1',
            });

            // suggested = 1 nano
            expect(result).toEqual({
                mode: 'reduce',
                requiredNanos: gasOnly + fromAmount + BUFFER,
                suggestedFromAmount: '0.000000001',
            });
        });
    });

    describe('safetyMarginNanos', () => {
        it('shrinks the suggested reduced amount when safetyMargin is larger', () => {
            const tonBalance = '0.4';
            const baseParams = {
                messages: [msg(550_000_000n)], // 0.55 TON total outflow
                tonBalance,
                gasBufferNanos: BUFFER,
                fromToken: TON,
                fromAmount: '0.5',
            };

            const lowMargin = checkTransferBalance({ ...baseParams, safetyMarginNanos: 5_000_000n });
            const highMargin = checkTransferBalance({ ...baseParams, safetyMarginNanos: 50_000_000n });

            // higher safety margin → less suggested
            expect(lowMargin?.mode).toBe('reduce');
            expect(highMargin?.mode).toBe('reduce');
            if (lowMargin?.mode === 'reduce' && highMargin?.mode === 'reduce') {
                expect(BigInt(lowMargin.suggestedFromAmount.replace('.', '').padEnd(10, '0'))).toBeGreaterThan(
                    BigInt(highMargin.suggestedFromAmount.replace('.', '').padEnd(10, '0')),
                );
            }
        });

        it('uses DEFAULT_SAFETY_MARGIN_NANOS when not provided', () => {
            const result = checkTransferBalance({
                messages: [msg(550_000_000n)],
                tonBalance: '0.4',
                gasBufferNanos: BUFFER,
                fromToken: TON,
                fromAmount: '0.5',
            });
            expect(result?.mode).toBe('reduce');
            // gasOnly = 50_000_000, balance = 400_000_000
            // suggested = 400 - 50 - 10 - 20 = 320 mTON
            if (result?.mode === 'reduce') {
                expect(result.suggestedFromAmount).toBe('0.32');
            }
        });
    });

    describe('composes checkTonBalance', () => {
        it('returns undefined when checkTonBalance would (sufficient or unloaded)', () => {
            // Same inputs as a sufficient-balance check
            const result = checkTransferBalance({
                messages: [msg(10_000_000n)],
                tonBalance: '1',
                gasBufferNanos: BUFFER,
                fromToken: TON,
                fromAmount: '0.005',
            });
            expect(result).toBeUndefined();
        });
    });
});
