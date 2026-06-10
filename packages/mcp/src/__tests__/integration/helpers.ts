/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Address } from '@ton/core';
import { afterAll, beforeAll, expect } from 'vitest';

import { expectSuccessfulEmulation } from './emulating-client.js';
import { createIntegrationHarness } from './harness.js';
import type { IntegrationHarness } from './harness.js';
import { getIntegrationMnemonic, TESTNET_FIXTURES } from './integration-env.js';

export function isSameAddress(value: unknown, expected: string): boolean {
    return typeof value === 'string' && Address.parse(value).equals(Address.parse(expected));
}

/** Registers beforeAll/afterAll for a harness; call inside a describe block. */
export function useHarness(walletVersion: 'v4r2' | 'agentic'): () => IntegrationHarness {
    let harness: IntegrationHarness | undefined;

    beforeAll(async () => {
        const mnemonic = getIntegrationMnemonic();
        if (!mnemonic) {
            throw new Error('TON_MCP_INTEGRATION_MNEMONIC is not set');
        }
        harness = await createIntegrationHarness({ mnemonic, walletVersion });
    });

    afterAll(async () => {
        await harness?.close();
    });

    return () => {
        if (!harness) {
            throw new Error('Harness is not initialized');
        }
        return harness;
    };
}

/** Calls a tool and asserts it did not fail. */
export async function callOk(
    harness: IntegrationHarness,
    name: string,
    args?: Record<string, unknown>,
): Promise<Record<string, unknown>> {
    const result = await harness.callTool(name, args);
    expect(result.isError, `${name} failed: ${JSON.stringify(result.payload)}`).toBe(false);
    expect(result.payload.success ?? true).not.toBe(false);
    return result.payload;
}

/** Calls a send tool, asserts exactly one BOC was intercepted and emulated successfully. */
export async function sendEmulated(
    harness: IntegrationHarness,
    name: string,
    args: Record<string, unknown>,
): Promise<{ payload: Record<string, unknown>; actionTypes: string[]; totalFees: bigint }> {
    const before = harness.apiClient.interceptedSends.length;
    const payload = await callOk(harness, name, args);
    expect(harness.apiClient.interceptedSends.length).toBe(before + 1);
    return { payload, ...expectSuccessfulEmulation(harness.apiClient.lastIntercepted()) };
}

/** Calls a tool with invalid input, asserts it failed without signing anything. */
export async function expectRejectedWithoutSend(
    harness: IntegrationHarness,
    name: string,
    args: Record<string, unknown>,
): Promise<void> {
    const before = harness.apiClient.interceptedSends.length;
    const result = await harness.callTool(name, args);
    expect(result.isError).toBe(true);
    expect(result.payload.success).toBe(false);
    expect(harness.apiClient.interceptedSends.length).toBe(before);
}

/** Looks up the fixture jetton via get_jettons, in the address format the tool returns. */
export async function fetchFixtureJetton(
    harness: IntegrationHarness,
): Promise<{ address: string; decimals: number; amountRaw: bigint }> {
    const payload = await callOk(harness, 'get_jettons');
    const jettons = payload.jettons as Array<{ address: string; decimals: number; amountRaw: string }>;
    const jetton = jettons.find((entry) => isSameAddress(entry.address, TESTNET_FIXTURES.jettonMasterAddress));
    if (!jetton) {
        throw new Error(`Fixture jetton ${TESTNET_FIXTURES.jettonMasterAddress} not found in wallet`);
    }
    return { address: jetton.address, decimals: jetton.decimals, amountRaw: BigInt(jetton.amountRaw) };
}
