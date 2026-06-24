/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Network, Signer, WalletV4R2Adapter } from '@ton/walletkit';

import { AgenticWalletAdapter } from '../../contracts/agentic_wallet/AgenticWalletAdapter.js';
import { createTonWalletMCP } from '../../factory.js';
import { EmulatingToncenterClient } from './emulating-client.js';
import { TESTNET_FIXTURES } from './integration-env.js';

export interface ToolResult {
    isError: boolean;
    payload: Record<string, unknown>;
}

export interface IntegrationHarness {
    apiClient: EmulatingToncenterClient;
    walletAddress: string;
    signerPublicKey: string;
    callTool(name: string, args?: Record<string, unknown>): Promise<ToolResult>;
    listToolNames(): Promise<string[]>;
    close(): Promise<void>;
}

export async function createIntegrationHarness(options: {
    mnemonic: string;
    walletVersion: 'v4r2' | 'agentic';
}): Promise<IntegrationHarness> {
    const originalConfigPath = process.env.TON_CONFIG_PATH;
    const tempDir = mkdtempSync(join(tmpdir(), 'ton-mcp-integration-'));
    process.env.TON_CONFIG_PATH = join(tempDir, 'config.json');

    const restoreEnvironment = () => {
        if (originalConfigPath) {
            process.env.TON_CONFIG_PATH = originalConfigPath;
        } else {
            delete process.env.TON_CONFIG_PATH;
        }
        rmSync(tempDir, { recursive: true, force: true });
    };

    try {
        const signer = await Signer.fromMnemonic(options.mnemonic.split(/\s+/), { type: 'ton' });
        const apiClient = new EmulatingToncenterClient();
        const network = Network.testnet();

        const adapter =
            options.walletVersion === 'agentic'
                ? await AgenticWalletAdapter.create(signer, {
                      client: apiClient,
                      network,
                      walletAddress: TESTNET_FIXTURES.agenticWalletAddress,
                      collectionAddress: TESTNET_FIXTURES.agenticCollectionAddress,
                  })
                : await WalletV4R2Adapter.create(signer, { client: apiClient, network });

        const server = await createTonWalletMCP({
            wallet: adapter,
            walletVersion: options.walletVersion,
        });

        const client = new Client({ name: 'mcp-integration-test', version: '1.0.0' });
        const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
        await server.connect(serverTransport);
        await client.connect(clientTransport);

        return {
            apiClient,
            walletAddress: adapter.getAddress(),
            signerPublicKey: signer.publicKey,

            async callTool(name: string, args: Record<string, unknown> = {}): Promise<ToolResult> {
                const result = await client.callTool({ name, arguments: args });
                const first = result.content[0];
                if (!first || first.type !== 'text') {
                    throw new Error(`Tool ${name} returned no text content`);
                }
                return {
                    isError: result.isError === true,
                    payload: JSON.parse(first.text) as Record<string, unknown>,
                };
            },

            async listToolNames(): Promise<string[]> {
                const tools = await client.listTools();
                return tools.tools.map((tool) => tool.name);
            },

            async close(): Promise<void> {
                try {
                    await Promise.allSettled([client.close(), server.close()]);
                } finally {
                    restoreEnvironment();
                }
            },
        };
    } catch (error) {
        restoreEnvironment();
        throw error;
    }
}
