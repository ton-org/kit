/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { describe, expect, it, vi } from 'vitest';

import { createMcpAgenticTools } from '../tools/agentic-tools.js';

function parseToolResult(
    result: Awaited<ReturnType<ReturnType<typeof createMcpAgenticTools>['deploy_agentic_subwallet']['handler']>>,
) {
    const first = result.content[0];
    if (!first || first.type !== 'text') {
        throw new Error('Expected text tool response');
    }
    return JSON.parse(first.text) as Record<string, unknown>;
}

describe('agentic tools', () => {
    it('deploy_agentic_subwallet signs, broadcasts, and returns deployment details', async () => {
        const service = {
            deployAgenticSubwallet: vi.fn(async () => ({
                success: true,
                message: 'deployed',
                normalizedHash: 'nh-deploy',
                subwalletAddress: 'EQSub',
                subwalletNftIndex: '1',
                ownerAddress: 'EQOwner',
                collectionAddress: 'EQColl',
                operatorPublicKey: '0xabc',
                amountNano: '50000000',
            })),
        } as never;

        const tools = createMcpAgenticTools(service);
        const result = parseToolResult(
            await tools.deploy_agentic_subwallet.handler({
                operatorPublicKey: '0xabc',
                metadata: { name: 'TestBot' },
            }),
        );

        expect(result).toMatchObject({ success: true, message: 'deployed' });
        expect(result.details).toMatchObject({
            normalizedHash: 'nh-deploy',
            subwalletAddress: 'EQSub',
        });
        expect(result.details).not.toHaveProperty('broadcast');
        expect(result.details).not.toHaveProperty('boc');

        expect(service.deployAgenticSubwallet).toHaveBeenCalledWith({
            operatorPublicKey: '0xabc',
            amountNano: '50000000',
            metadata: { name: 'TestBot' },
        });
    });
});
