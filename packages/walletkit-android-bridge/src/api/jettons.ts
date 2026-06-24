/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { Jetton, JettonInfo, Network } from '@ton/walletkit';

import { getKit, walletCall } from '../utils/bridge';

export const getJettons = (args: { walletId: string }) => walletCall('getJettons', args);
export const createTransferJettonTransaction = (args: { walletId: string }) =>
    walletCall('createTransferJettonTransaction', args);
export const getJettonBalance = (args: { walletId: string }) => walletCall('getJettonBalance', args);
export const getJettonWalletAddress = (args: { walletId: string }) => walletCall('getJettonWalletAddress', args);

export async function getJettonInfo(args: { address: string; network: Network }): Promise<JettonInfo | null> {
    const instance = await getKit();
    return instance.jettons.getJettonInfo(args.address, args.network);
}

export async function getAddressJettons(args: {
    userAddress: string;
    network: Network;
    offset?: number;
    limit?: number;
}): Promise<Jetton[]> {
    const instance = await getKit();
    return instance.jettons.getAddressJettons(args.userAddress, args.network, args.offset, args.limit);
}

export async function validateJettonAddress(args: { address: string }): Promise<{ valid: boolean }> {
    const instance = await getKit();
    return { valid: instance.jettons.validateJettonAddress(args.address) };
}
