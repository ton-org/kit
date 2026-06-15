/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { toNano } from '@ton/core';
import { Network } from '@ton/appkit';
import type { UserFriendlyAddress } from '@ton/appkit';

/**
 * Pre-deployed forwarder contract per network. Receives a TEP-74 jetton-transfer
 * with the NFT deploy spec in `forward_payload` and emits the actual NFT deploy
 * message itself — so TonAPI gasless only ever sees a plain jetton transfer.
 */
const MINT_FORWARD_ADDRESS_BY_CHAIN_ID: Record<string, UserFriendlyAddress> = {
    [Network.mainnet().chainId]: 'EQD_fO0VDlkmjRFcpiyOAFz8CWhLDoyOM9jFN4Gw7tP86YgR' as UserFriendlyAddress,
    // [Network.testnet().chainId]: 'kQD_fO0VDlkmjRFcpiyOAFz8CWhLDoyOM9jFN4Gw7tP86TOb' as UserFriendlyAddress,
};

export const getMintForwardAddress = (chainId: string): UserFriendlyAddress | undefined =>
    MINT_FORWARD_ADDRESS_BY_CHAIN_ID[chainId];

/** TEP-74 jetton transfer opcode. */
export const JETTON_TRANSFER_OP = 0x0f8a7ea5;

/** Symbolic jetton amount in the transfer. MintForward doesn't inspect it. */
export const USDT_FORWARD_JETTON_AMOUNT = 1n;

/**
 * GRAM budget for the jetton-transfer. Splits into:
 * - ~0.0099 GRAM gas at the user's jetton-wallet
 * - ~0.0099 GRAM gas at MintForward's jetton-wallet
 * - `FORWARD_TON_AMOUNT` forwarded to MintForward as the deploy-funding payload
 * - remaining excess routed to `response_destination` (relayer)
 */
export const JETTON_GAS_BUDGET = toNano('0.02');

/**
 * GRAM delivered to MintForward with the transfer notification — must cover the
 * contract's own gas + the inner 0.001 GRAM NFT-deploy value. Lower than this
 * (currently 0.0015) relies on accumulated balance from prior mints; safer
 * floor for cold-start funding is ~0.015 GRAM.
 */
export const FORWARD_TON_AMOUNT = toNano('0.0015');
