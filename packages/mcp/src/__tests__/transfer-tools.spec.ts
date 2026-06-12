/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { describe, expect, it, vi } from 'vitest';

import { createMcpTransferTools } from '../tools/transfer-tools.js';

function parseToolResult(
    result: Awaited<ReturnType<ReturnType<typeof createMcpTransferTools>['send_ton']['handler']>>,
) {
    const first = result.content[0];
    if (!first || first.type !== 'text') {
        throw new Error('Expected text tool response');
    }
    return JSON.parse(first.text) as Record<string, unknown>;
}

describe('transfer tools', () => {
    it('send_ton prepares a transaction without broadcasting', async () => {
        const service = {
            buildTonTransferTransaction: vi.fn(async () => ({
                messages: [{ address: 'EQTo', amount: '1500000000' }],
                validUntil: 123,
            })),
        } as never;

        const tools = createMcpTransferTools(service);

        const result = parseToolResult(
            await tools.send_ton.handler({
                toAddress: 'EQTo',
                amount: '1.5',
            }),
        );

        expect(result).toMatchObject({
            success: true,
            transaction: {
                messages: [{ address: 'EQTo', amount: '1500000000' }],
                validUntil: 123,
            },
        });
        expect(result.note).toContain('send_raw_transaction');
        expect(result).not.toHaveProperty('normalizedHash');

        expect(
            (service as { buildTonTransferTransaction: ReturnType<typeof vi.fn> }).buildTonTransferTransaction,
        ).toHaveBeenCalledWith('EQTo', '1500000000', undefined);
    });

    it('send_jetton converts the amount with jetton decimals and prepares messages', async () => {
        const service = {
            getJettons: vi.fn(async () => [{ address: 'EQJetton', decimals: 9, symbol: 'JET' }]),
            buildJettonTransferTransaction: vi.fn(async () => ({
                messages: [{ address: 'EQWallet', amount: '50000000', payload: 'base64payload' }],
            })),
        } as never;

        const tools = createMcpTransferTools(service);

        const result = parseToolResult(
            await tools.send_jetton.handler({
                toAddress: 'EQTo',
                jettonAddress: 'EQJetton',
                amount: '2.5',
            }),
        );

        expect(result).toMatchObject({
            success: true,
            transaction: {
                messages: [{ address: 'EQWallet', amount: '50000000', payload: 'base64payload' }],
            },
        });
        expect(result.note).toContain('send_raw_transaction');

        expect(
            (service as { buildJettonTransferTransaction: ReturnType<typeof vi.fn> }).buildJettonTransferTransaction,
        ).toHaveBeenCalledWith('EQTo', 'EQJetton', '2500000000', undefined);
    });

    it('send_jetton fails when jetton decimals cannot be determined', async () => {
        const service = {
            getJettons: vi.fn(async () => []),
            buildJettonTransferTransaction: vi.fn(),
        } as never;

        const tools = createMcpTransferTools(service);
        const result = await tools.send_jetton.handler({
            toAddress: 'EQTo',
            jettonAddress: 'EQUnknown',
            amount: '1',
        });

        expect(result.isError).toBe(true);
        expect(
            (service as { buildJettonTransferTransaction: ReturnType<typeof vi.fn> }).buildJettonTransferTransaction,
        ).not.toHaveBeenCalled();
    });

    it('send_raw_transaction signs, broadcasts, and returns normalizedHash', async () => {
        const service = {
            sendRawTransaction: vi.fn(async () => ({
                success: true,
                message: 'Raw transaction sent',
                normalizedHash: 'hash-raw',
            })),
        } as never;

        const tools = createMcpTransferTools(service);

        const result = parseToolResult(
            await tools.send_raw_transaction.handler({
                messages: [{ address: 'EQTo', amount: '123' }],
            }),
        );

        expect(result).toMatchObject({
            success: true,
            normalizedHash: 'hash-raw',
        });

        expect((service as { sendRawTransaction: ReturnType<typeof vi.fn> }).sendRawTransaction).toHaveBeenCalledWith({
            messages: [{ address: 'EQTo', amount: '123' }],
            validUntil: undefined,
            fromAddress: undefined,
        });
    });

    it('send_raw_transaction surfaces service failures', async () => {
        const service = {
            sendRawTransaction: vi.fn(async () => ({
                success: false,
                message: 'broadcast failed',
            })),
        } as never;

        const tools = createMcpTransferTools(service);
        const result = await tools.send_raw_transaction.handler({
            messages: [{ address: 'EQTo', amount: '123' }],
        });

        expect(result.isError).toBe(true);
    });
});
