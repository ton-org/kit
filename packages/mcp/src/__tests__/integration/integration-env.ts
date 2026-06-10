/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PACKAGE_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

/**
 * Pre-provisioned testnet contracts: the wallet derived from
 * TON_MCP_INTEGRATION_MNEMONIC owns the jetton balance and the NFT item,
 * and its key is the operator key of the agentic wallet.
 */
export const TESTNET_FIXTURES = {
    walletAddress: 'UQBzDgiMxF2HN9dxUVXfaYmEBqwm8QLbzkTzIV8rCF6qp_-p',
    agenticWalletAddress: '0QAiM-UoaiPQJvGoJrTMmsaBxyZfviUepynP9hoSo5-H2hkq',
    agenticCollectionAddress: 'kQByQ19qvWxW7VibSbGEgZiYMqilHY5y1a_eeSL2VaXhf5ax',
    jettonMasterAddress: 'kQD0GKBM8ZbryVk2aESmzfU6b9b_8era_IkvBSELujFZPsyy',
    nftItemAddress: 'kQCuzP_CmmiIpll5PVx6m8_1DiwWvqgCfaQLFzVrEz7r4Hcm',
    // Normalized external-in message hash, 0x-prefixed as send tools return it.
    completedTransactionHash: '0x6a6276f04b1575092b373cc35f3b29000f3e133da3931f5d3c502299aaeeb1ab',
} as const;

function loadLocalEnvFile(): void {
    const envPath = join(PACKAGE_ROOT, '.env.integration.local');
    if (!existsSync(envPath)) {
        return;
    }
    for (const line of readFileSync(envPath, 'utf8').split('\n')) {
        const match = line.match(/^([A-Z0-9_]+)\s*=\s*"?([^"\n]*?)"?\s*$/);
        if (match && process.env[match[1]] === undefined) {
            process.env[match[1]] = match[2];
        }
    }
}

export function getIntegrationMnemonic(): string | undefined {
    loadLocalEnvFile();
    const value = process.env.TON_MCP_INTEGRATION_MNEMONIC?.trim();
    if (!value || value.split(/\s+/).length < 12) {
        return undefined;
    }
    return value;
}
