/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { describe, expect, it, vi } from 'vitest';

import { createMcpNftTools } from '../tools/nft-tools.js';

function parseToolResult(result: Awaited<ReturnType<ReturnType<typeof createMcpNftTools>['send_nft']['handler']>>) {
    const first = result.content[0];
    if (!first || first.type !== 'text') {
        throw new Error('Expected text tool response');
    }
    return JSON.parse(first.text) as Record<string, unknown>;
}

describe('nft tools', () => {
    it('send_nft prepares a transfer without broadcasting', async () => {
        const service = {
            buildNftTransferTransaction: vi.fn(async () => ({
                messages: [{ address: 'EQNft', amount: '100000000', payload: 'transfer-body' }],
            })),
            getNfts: vi.fn(),
            getNftsByAddress: vi.fn(),
            getNft: vi.fn(),
        } as never;

        const tools = createMcpNftTools(service);
        const result = parseToolResult(
            await tools.send_nft.handler({
                nftAddress: 'EQNft',
                toAddress: 'EQTo',
            }),
        );

        expect(result).toMatchObject({
            success: true,
            transaction: {
                messages: [{ address: 'EQNft', amount: '100000000', payload: 'transfer-body' }],
            },
            nftAddress: 'EQNft',
            recipient: 'EQTo',
        });
        expect(result.note).toContain('send_raw_transaction');

        expect(service.buildNftTransferTransaction).toHaveBeenCalledWith('EQNft', 'EQTo', undefined);
    });
});
