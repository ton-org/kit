/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { describe, expect, it } from 'vitest';

import { actionDetails, buildThenSendEmulated, callOk, isSameAddress, sendEmulated, useHarness } from './helpers.js';
import { getIntegrationMnemonic, TESTNET_FIXTURES } from './integration-env.js';

const FIXTURES = TESTNET_FIXTURES;

describe.skipIf(!getIntegrationMnemonic())('MCP agentic wallet flows (testnet reads, emulated sends)', () => {
    const getHarness = useHarness('agentic');

    it('exposes the agentic toolset including subwallet deployment', async () => {
        const names = await getHarness().listToolNames();
        expect(names).toEqual(expect.arrayContaining(['agentic_deploy_subwallet', 'build_ton_transfer']));
    });

    it('get_wallet returns the deployed agentic wallet', async () => {
        const payload = await callOk(getHarness(), 'get_wallet');
        expect(isSameAddress(payload.address, FIXTURES.agenticWalletAddress)).toBe(true);
        expect(payload.network).toBe('testnet');
    });

    it('get_balance returns a positive balance', async () => {
        const payload = await callOk(getHarness(), 'get_balance');
        expect(BigInt(payload.amountRaw as string) > 0n).toBe(true);
    });

    it('build_ton_transfer broadcast signed by the operator key passes contract validation in emulation', async () => {
        const { actions, totalFees } = await buildThenSendEmulated(getHarness(), 'build_ton_transfer', {
            toAddress: FIXTURES.walletAddress,
            amount: '0.01',
            comment: 'mcp agentic integration test',
        });
        const transfer = actionDetails(actions, 'ton_transfer');
        expect(isSameAddress(transfer.source, FIXTURES.agenticWalletAddress)).toBe(true);
        expect(isSameAddress(transfer.destination, FIXTURES.walletAddress)).toBe(true);
        expect(transfer.value).toBe('10000000');
        expect(transfer.comment).toBe('mcp agentic integration test');
        expect(totalFees > 0n).toBe(true);
    });

    it('agentic_deploy_subwallet emulates a child wallet deployment from the root', async () => {
        const { payload, actions } = await sendEmulated(getHarness(), 'agentic_deploy_subwallet', {
            operatorPublicKey: getHarness().signerPublicKey,
            metadata: { name: 'mcp-integration-test-subwallet' },
            amountTon: '0.05',
        });
        const { subwalletAddress } = payload.details as { subwalletAddress: string };
        const deploy = actionDetails(actions, 'contract_deploy');
        expect(isSameAddress(deploy.source, FIXTURES.agenticWalletAddress)).toBe(true);
        expect(isSameAddress(deploy.destination, subwalletAddress)).toBe(true);
        expect(deploy.value).toBe('50000000');
        // The subwallet is minted as an NFT item of the agentic collection.
        const mint = actionDetails(actions, 'nft_mint');
        expect(isSameAddress(mint.nft_collection, FIXTURES.agenticCollectionAddress)).toBe(true);
        expect(isSameAddress(mint.nft_item, subwalletAddress)).toBe(true);
        expect(isSameAddress(mint.owner, FIXTURES.agenticWalletAddress)).toBe(true);
    });
});
