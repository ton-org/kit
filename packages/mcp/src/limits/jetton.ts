/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Cell } from '@ton/core';
import { ParseStack } from '@ton/walletkit';
import type { ApiClient } from '@ton/walletkit';

// TEP-74 transfer (0x0f8a7ea5) and burn (0x595f07bc) share the same
// `op:uint32, query_id:uint64, amount:VarUInteger 16` prefix.
const JETTON_TRANSFER_OP = 0x0f8a7ea5;
const JETTON_BURN_OP = 0x595f07bc;

/**
 * Parse the jetton amount leaving the wallet from a message payload, or `null`
 * when the payload is absent or is not a TEP-74 transfer/burn.
 */
export function parseJettonOutflowAmount(payloadBase64: string | null | undefined): bigint | null {
    if (!payloadBase64) {
        return null;
    }
    try {
        const slice = Cell.fromBase64(payloadBase64).beginParse();
        if (slice.remainingBits < 96) {
            return null;
        }
        const op = slice.loadUint(32);
        if (op !== JETTON_TRANSFER_OP && op !== JETTON_BURN_OP) {
            return null;
        }
        slice.loadUintBig(64); // query_id
        return slice.loadCoins();
    } catch {
        return null;
    }
}

export interface JettonWalletInfo {
    owner: string;
    master: string;
}

/**
 * Resolve a jetton wallet's (owner, master) via `get_wallet_data`.
 *
 * Returns `null` only when `get_wallet_data` *ran* but the address is not a usable
 * jetton wallet (non-zero exit, or a stack that does not decode to owner+master) —
 * a definitive "not owned by us" answer the caller may safely drop. An RPC failure
 * (network error, timeout, 4xx/5xx) is *not* swallowed: it propagates so spend
 * metering fails closed rather than silently under-counting an unresolvable wallet.
 */
export async function getJettonWalletInfoFromClient(
    client: ApiClient,
    jettonWalletAddress: string,
): Promise<JettonWalletInfo | null> {
    const result = await client.runGetMethod(jettonWalletAddress, 'get_wallet_data');
    if (result.exitCode !== 0) {
        return null;
    }
    try {
        const stack = ParseStack(result.stack);
        const owner = loadAddressFromStackItem(stack[1]);
        const master = loadAddressFromStackItem(stack[2]);
        if (!owner || !master) {
            return null;
        }
        return { owner: owner.toString(), master: master.toString() };
    } catch {
        return null;
    }
}

function loadAddressFromStackItem(item: ReturnType<typeof ParseStack>[number] | undefined) {
    if (!item || (item.type !== 'slice' && item.type !== 'cell')) {
        return null;
    }
    return item.cell.asSlice().loadAddress();
}
