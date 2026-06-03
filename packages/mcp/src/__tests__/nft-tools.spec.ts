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
    it('send_nft with broadcast=false returns signed BoC fields', async () => {
        const service = {
            sendNft: vi.fn(async () => ({
                success: true,
                message: 'signed nft',
                normalizedHash: 'nh-nft',
                boc: 'boc-nft',
                normalizedBoc: 'norm-nft',
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
                broadcast: false,
            }),
        );

        expect(result).toMatchObject({
            success: true,
            normalizedHash: 'nh-nft',
            boc: 'boc-nft',
            normalizedBoc: 'norm-nft',
            broadcast: false,
        });

        expect(service.sendNft).toHaveBeenCalledWith('EQNft', 'EQTo', undefined, { broadcast: false });
    });
});
