/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Address } from '@ton/core';
import { formatUnits } from '@ton/walletkit';
import { describe, expect, it } from 'vitest';

import {
    actionDetails,
    callOk,
    expectRejectedWithoutSend,
    fetchFixtureJetton,
    isSameAddress,
    sendEmulated,
    useHarness,
} from './helpers.js';
import { getIntegrationMnemonic, TESTNET_FIXTURES } from './integration-env.js';

const FIXTURES = TESTNET_FIXTURES;

describe.skipIf(!getIntegrationMnemonic())('MCP standard wallet flows (testnet reads, emulated sends)', () => {
    const getHarness = useHarness('v4r2');

    it('exposes the single-wallet toolset', async () => {
        const names = await getHarness().listToolNames();
        expect(names).toEqual(
            expect.arrayContaining(['get_wallet', 'send_ton', 'send_jetton', 'send_nft', 'emulate_transaction']),
        );
        expect(names).not.toContain('list_wallets');
        expect(names).not.toContain('agentic_deploy_subwallet');
    });

    it('get_wallet returns the mnemonic-derived testnet wallet', async () => {
        const payload = await callOk(getHarness(), 'get_wallet');
        console.log(payload.address);
        expect(isSameAddress(payload.address, FIXTURES.walletAddress)).toBe(true);
        expect(payload.network).toBe('testnet');
    });

    it('get_balance returns a positive on-chain balance', async () => {
        const payload = await callOk(getHarness(), 'get_balance');
        expect(BigInt(payload.amountRaw as string) > 0n).toBe(true);
    });

    it('get_balance_by_address reads an arbitrary fixture address', async () => {
        const payload = await callOk(getHarness(), 'get_balance_by_address', {
            address: FIXTURES.agenticWalletAddress,
        });
        expect(BigInt(payload.amountRaw as string) > 0n).toBe(true);
    });

    it('get_jettons lists the fixture jetton with a positive balance', async () => {
        const jetton = await fetchFixtureJetton(getHarness());
        expect(jetton.amountRaw > 0n).toBe(true);
    });

    it('get_jetton_balance resolves the jetton wallet on-chain', async () => {
        const payload = await callOk(getHarness(), 'get_jetton_balance', {
            jettonAddress: FIXTURES.jettonMasterAddress,
        });
        expect(BigInt(payload.amountRaw as string) > 0n).toBe(true);
    });

    it('get_jetton_info returns metadata for the fixture jetton master', async () => {
        const payload = await callOk(getHarness(), 'get_jetton_info', {
            jettonAddress: FIXTURES.jettonMasterAddress,
        });
        expect(JSON.stringify(payload)).toContain('decimals');
    });

    it('get_nfts includes the fixture NFT owned by the wallet', async () => {
        const payload = await callOk(getHarness(), 'get_nfts', { limit: 100 });
        const text = JSON.stringify(payload).toUpperCase();
        const nft = Address.parse(FIXTURES.nftItemAddress);
        expect(text.includes(nft.toRawString().toUpperCase()) || text.includes(nft.toString().toUpperCase())).toBe(
            true,
        );
    });

    it('get_nft returns the fixture NFT item by address', async () => {
        await callOk(getHarness(), 'get_nft', { nftAddress: FIXTURES.nftItemAddress });
    });

    it('get_transactions returns real history', async () => {
        const payload = await callOk(getHarness(), 'get_transactions', { limit: 5 });
        expect((payload.transactions as unknown[]).length).toBeGreaterThan(0);
    });

    it('get_known_jettons returns the static registry', async () => {
        const payload = await callOk(getHarness(), 'get_known_jettons');
        expect(JSON.stringify(payload)).toContain('USD');
    });

    it('generate_ton_proof signs a proof without broadcasting', async () => {
        const before = getHarness().apiClient.interceptedSends.length;
        const payload = await callOk(getHarness(), 'generate_ton_proof', {
            domain: 'example.com',
            payload: 'mcp-integration-test',
        });
        expect(payload.proof).toBeDefined();
        expect(getHarness().apiClient.interceptedSends.length).toBe(before);
    });

    it('send_ton: captured BOC emulates the requested transfer', async () => {
        const { payload, actions, totalFees } = await sendEmulated(getHarness(), 'send_ton', {
            toAddress: FIXTURES.agenticWalletAddress,
            amount: '0.01',
            comment: 'mcp integration test',
        });
        expect((payload.normalizedHash as string).length).toBeGreaterThan(10);
        const transfer = actionDetails(actions, 'ton_transfer');
        expect(isSameAddress(transfer.source, getHarness().walletAddress)).toBe(true);
        expect(isSameAddress(transfer.destination, FIXTURES.agenticWalletAddress)).toBe(true);
        expect(transfer.value).toBe('10000000');
        expect(transfer.comment).toBe('mcp integration test');
        expect(totalFees > 0n).toBe(true);
    });

    it('get_transaction_status reports a confirmed on-chain transaction as completed', async () => {
        const payload = await callOk(getHarness(), 'get_transaction_status', {
            normalizedHash: FIXTURES.completedTransactionHash,
        });
        expect(payload.status).toBe('completed');
        expect(payload.pendingMessages).toBe(0);
    });

    it('send_jetton: captured BOC emulates the requested jetton transfer', async () => {
        const jetton = await fetchFixtureJetton(getHarness());
        const amountRaw = jetton.amountRaw / 10n > 0n ? jetton.amountRaw / 10n : 1n;
        const { actions } = await sendEmulated(getHarness(), 'send_jetton', {
            toAddress: FIXTURES.agenticWalletAddress,
            jettonAddress: jetton.address,
            amount: formatUnits(amountRaw.toString(), jetton.decimals),
            comment: 'mcp integration test',
        });
        const transfer = actionDetails(actions, 'jetton_transfer');
        expect(isSameAddress(transfer.asset, FIXTURES.jettonMasterAddress)).toBe(true);
        expect(isSameAddress(transfer.sender, getHarness().walletAddress)).toBe(true);
        expect(isSameAddress(transfer.receiver, FIXTURES.agenticWalletAddress)).toBe(true);
        expect(transfer.amount).toBe(amountRaw.toString());
        expect(transfer.comment).toBe('mcp integration test');
    });

    it('send_nft: captured BOC emulates the requested ownership transfer', async () => {
        const { actions } = await sendEmulated(getHarness(), 'send_nft', {
            nftAddress: FIXTURES.nftItemAddress,
            toAddress: FIXTURES.agenticWalletAddress,
            comment: 'mcp integration test',
        });
        const transfer = actionDetails(actions, 'nft_transfer');
        expect(isSameAddress(transfer.nft_item, FIXTURES.nftItemAddress)).toBe(true);
        expect(isSameAddress(transfer.old_owner, getHarness().walletAddress)).toBe(true);
        expect(isSameAddress(transfer.new_owner, FIXTURES.agenticWalletAddress)).toBe(true);
    });

    it('send_raw_transaction: captured BOC emulates the raw message', async () => {
        const { actions, totalFees } = await sendEmulated(getHarness(), 'send_raw_transaction', {
            messages: [{ address: FIXTURES.agenticWalletAddress, amount: '10000000' }],
        });
        const transfer = actionDetails(actions, 'ton_transfer');
        expect(isSameAddress(transfer.destination, FIXTURES.agenticWalletAddress)).toBe(true);
        expect(transfer.value).toBe('10000000');
        expect(totalFees > 0n).toBe(true);
    });

    it('emulate_transaction previews money flow without touching sendBoc', async () => {
        const before = getHarness().apiClient.interceptedSends.length;
        const payload = await callOk(getHarness(), 'emulate_transaction', {
            messages: [{ address: FIXTURES.agenticWalletAddress, amount: '10000000' }],
        });
        expect(BigInt(payload.totalFees as string) > 0n).toBe(true);
        expect(payload.moneyFlow).not.toBeNull();
        expect((payload.actions as unknown[]).length).toBeGreaterThan(0);
        expect(getHarness().apiClient.interceptedSends.length).toBe(before);
    });

    it('send_ton rejects a malformed recipient without signing', async () => {
        await expectRejectedWithoutSend(getHarness(), 'send_ton', { toAddress: 'not-a-ton-address', amount: '0.01' });
    });

    it('send_jetton rejects a jetton the wallet does not own without signing', async () => {
        await expectRejectedWithoutSend(getHarness(), 'send_jetton', {
            toAddress: FIXTURES.agenticWalletAddress,
            jettonAddress: FIXTURES.agenticCollectionAddress,
            amount: '1',
        });
    });
});
