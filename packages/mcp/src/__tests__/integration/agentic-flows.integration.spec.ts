/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Address } from '@ton/core';
import { describe, expect, it } from 'vitest';

import { callOk, isSameAddress, sendEmulated, useHarness } from './helpers.js';
import { getIntegrationMnemonic, TESTNET_FIXTURES } from './integration-env.js';

const FIXTURES = TESTNET_FIXTURES;

describe.skipIf(!getIntegrationMnemonic())('MCP agentic wallet flows (testnet reads, emulated sends)', () => {
    const getHarness = useHarness('agentic');

    it('exposes the agentic toolset including subwallet deployment', async () => {
        const names = await getHarness().listToolNames();
        expect(names).toEqual(expect.arrayContaining(['agentic_deploy_subwallet', 'send_ton']));
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

    it('send_ton signed by the operator key passes contract validation in emulation', async () => {
        const { actionTypes, totalFees } = await sendEmulated(getHarness(), 'send_ton', {
            toAddress: FIXTURES.walletAddress,
            amount: '0.01',
            comment: 'mcp agentic integration test',
        });
        expect(actionTypes).toContain('ton_transfer');
        expect(totalFees > 0n).toBe(true);
    });

    it('agentic_deploy_subwallet emulates a child wallet deployment from the root', async () => {
        const { payload, actionTypes } = await sendEmulated(getHarness(), 'agentic_deploy_subwallet', {
            operatorPublicKey: getHarness().signerPublicKey,
            metadata: { name: 'mcp-integration-test-subwallet' },
            amountTon: '0.05',
        });
        const details = payload.details as { subwalletAddress: string };
        expect(() => Address.parse(details.subwalletAddress)).not.toThrow();
        expect(actionTypes).toContain('contract_deploy');
    });
});
