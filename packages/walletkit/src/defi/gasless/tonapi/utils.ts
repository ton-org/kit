/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
    Address,
    beginCell,
    Cell,
    external,
    internal,
    loadMessageRelaxed,
    loadStateInit,
    storeMessage,
    storeMessageRelaxed,
} from '@ton/core';

import { Network } from '../../../api/models';
import type { Base64String, TransactionRequestMessage } from '../../../api/models';
import { TonClientError } from '../../../clients/TonClientError';
import { asBase64, HexToBase64 } from '../../../utils/base64';
import { asHex } from '../../../utils/hex';
import { GaslessError, GaslessErrorCode } from '../errors';

export const stripHexPrefix = (value: string): string => {
    return value.startsWith('0x') ? value.slice(2) : value;
};

/**
 * TonAPI returns BoCs as bare hex strings (no `0x` prefix); the walletkit domain
 * uses base64 (`Base64String`). Re-encoding is byte-identical; `asHex` validates
 * the hex first. Shared by the quote and send mappers.
 */
export const hexBocToBase64 = (hex: string): Base64String => {
    return HexToBase64(asHex(hex.startsWith('0x') ? hex : `0x${hex}`));
};

export const cellToBase64 = (cell: Cell): Base64String => {
    return asBase64(cell.toBoc().toString('base64'));
};

export const buildInternalMessageCell = (message: TransactionRequestMessage): Cell => {
    const to = Address.parse(message.address);
    const value = BigInt(message.amount);
    const body = message.payload ? Cell.fromBase64(message.payload) : beginCell().endCell();
    const init = message.stateInit ? loadStateInit(Cell.fromBase64(message.stateInit).beginParse()) : undefined;

    return beginCell()
        .storeWritable(
            storeMessageRelaxed(
                internal({
                    to,
                    value,
                    // Jetton transfers (the primary gasless use case) require bounce=true;
                    // TransactionRequestMessage does not carry a bounce flag, so we default
                    // to true. Callers needing non-bounceable messages should handle that
                    // outside the gasless flow.
                    bounce: true,
                    body,
                    init,
                }),
            ),
        )
        .endCell();
};

/**
 * Convert an internal-message BoC (what `wallet.signMessage` returns) into an
 * external message BoC that the relayer accepts for broadcast.
 */
export const internalBocToExternalMessageBoc = (internalBoc: Base64String): Cell => {
    const parsed = Cell.fromBase64(internalBoc);
    const { info, body, init } = loadMessageRelaxed(parsed.beginParse());

    if (info.type !== 'internal') {
        throw new GaslessError('Signed message must be an internal message', GaslessErrorCode.SendFailed);
    }

    return beginCell()
        .storeWritable(
            storeMessage(
                external({
                    to: info.dest,
                    init: init ?? undefined,
                    body,
                }),
            ),
        )
        .endCell();
};

/**
 * Reconstruct a `Network` instance from a chainId string. Used to map
 * `Object.keys(chainConfig)` back to `Network` objects.
 */
export const networkFromChainId = (chainId: string): Network => {
    switch (chainId) {
        case Network.mainnet().chainId:
            return Network.mainnet();
        case Network.testnet().chainId:
            return Network.testnet();
        case Network.tetra().chainId:
            return Network.tetra();
        default:
            return Network.custom(chainId);
    }
};

/**
 * If this function returns true — that means we should retry request
 * We should only retry false if we are sure that retrying will not help (for example, wrong input data, abort)
 */
export const isTransientError = (error: unknown): boolean => {
    if (error instanceof TonClientError) {
        // retry codes <400 and >=500
        if (error.status >= 500 || error.status < 400) {
            return true;
        }

        // retry codes 408 and 429
        if (error.status === 408 || error.status === 429) {
            return true;
        }

        // do not retry every other 400s errors
        return false;
    }

    // do not retry AbortError
    if (typeof error === 'object' && error !== null && 'name' in error) {
        if (error.name === 'AbortError') {
            return false;
        }
    }

    // Retry anything unknown
    return true;
};
