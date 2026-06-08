/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
    AccountState,
    AccountStates,
    Base64String,
    EmulationResult,
    GetMethodResult,
    MasterchainInfo,
    NFTsRequest,
    NFTsResponse,
    RawStackItem,
    TokenAmount,
    UserFriendlyAddress,
    UserNFTsRequest,
} from '@ton/walletkit';

import { getWallet } from '../utils/bridge';

// Handlers for the Kotlin `BridgedJSAPIClient` proxy. Each Android-side call to
// `wallet.client.<method>(...)` round-trips through `BridgeRpcClient.walletClient*`
// to one of these handlers, which dispatches against the same wallet's JS-side
// `wallet.client` (an `ApiClient`) and returns the result. Mirrors the iOS
// `JSTONAPIClient` adapter.

export async function walletClientSendBoc(args: { walletId: string; boc: string }): Promise<{ result: string }> {
    const w = await getWallet(args.walletId);
    const result = await w.client.sendBoc(args.boc as Base64String);
    return { result };
}

export async function walletClientRunGetMethod(args: {
    walletId: string;
    address: string;
    method: string;
    stack?: RawStackItem[];
    seqno?: number;
}): Promise<GetMethodResult> {
    const w = await getWallet(args.walletId);
    return w.client.runGetMethod(args.address as UserFriendlyAddress, args.method, args.stack, args.seqno);
}

export async function walletClientGetBalance(args: {
    walletId: string;
    address: string;
    seqno?: number;
}): Promise<{ result: TokenAmount }> {
    const w = await getWallet(args.walletId);
    const result = await w.client.getBalance(args.address as UserFriendlyAddress, args.seqno);
    return { result };
}

export async function walletClientGetMasterchainInfo(args: { walletId: string }): Promise<MasterchainInfo> {
    const w = await getWallet(args.walletId);
    return w.client.getMasterchainInfo();
}

export async function walletClientNftItemsByAddress(args: {
    walletId: string;
    request: NFTsRequest;
}): Promise<NFTsResponse> {
    const w = await getWallet(args.walletId);
    return w.client.nftItemsByAddress(args.request);
}

export async function walletClientNftItemsByOwner(args: {
    walletId: string;
    request: UserNFTsRequest;
}): Promise<NFTsResponse> {
    const w = await getWallet(args.walletId);
    return w.client.nftItemsByOwner(args.request);
}

export async function walletClientFetchEmulation(args: {
    walletId: string;
    messageBoc: string;
    ignoreSignature?: boolean;
}): Promise<EmulationResult> {
    const w = await getWallet(args.walletId);
    return w.client.fetchEmulation(args.messageBoc as Base64String, args.ignoreSignature);
}

export async function walletClientAccountState(args: {
    walletId: string;
    address: string;
    seqno?: number;
}): Promise<AccountState> {
    const w = await getWallet(args.walletId);
    return w.client.getAccountState(args.address as UserFriendlyAddress, args.seqno);
}

export async function walletClientAccountStates(args: {
    walletId: string;
    addresses: string[];
}): Promise<AccountStates> {
    const w = await getWallet(args.walletId);
    return w.client.getAccountStates(args.addresses as UserFriendlyAddress[]);
}

export async function walletClientResolveDnsWallet(args: {
    walletId: string;
    domain: string;
}): Promise<{ result: string | null }> {
    const w = await getWallet(args.walletId);
    const result = await w.client.resolveDnsWallet(args.domain);
    return { result: result ?? null };
}

export async function walletClientBackResolveDnsWallet(args: {
    walletId: string;
    address: string;
}): Promise<{ result: string | null }> {
    const w = await getWallet(args.walletId);
    const result = await w.client.backResolveDnsWallet(args.address as UserFriendlyAddress);
    return { result: result ?? null };
}
