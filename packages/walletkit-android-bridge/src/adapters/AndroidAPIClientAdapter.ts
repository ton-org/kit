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
    ApiClient,
    Base64String,
    EmulationResult,
    GetEventsRequest,
    GetEventsResponse,
    GetJettonsByAddressRequest,
    GetJettonsByOwnerRequest,
    GetMethodResult,
    GetPendingTraceRequest,
    GetPendingTransactionsRequest,
    GetTraceRequest,
    GetTransactionByHashRequest,
    JettonsResponse,
    MasterchainInfo,
    Network,
    NFTsRequest,
    NFTsResponse,
    RawStackItem,
    TokenAmount,
    ToncenterResponseJettonMasters,
    ToncenterTracesResponse,
    TransactionsByAddressRequest,
    TransactionsResponse,
    UserFriendlyAddress,
    UserNFTsRequest,
} from '@ton/walletkit';

import { bridgeRequestSync, bridgeRequestSyncTyped } from '../transport/nativeBridge';

/**
 * Android native API client adapter — TS counterpart to the Kotlin `TONAPIClient`.
 *
 * Every method dispatches through the single sync bridge entry point
 * (`window.WalletKitNative.adapterCallSync`) under the `api.*` namespace. The adapter
 * only constructs the params object and picks whether the response is a raw string or
 * a JSON-encoded value — JSON marshalling and error wrapping live in [bridgeRequestSync].
 *
 * Methods iOS's `SwiftAPIClientAdapter` throws on (the ones the Swift host doesn't
 * delegate either) are thrown here too — keeps the two adapters at parity until the
 * host implements them. Bridge-availability checks belong to the bootstrap layer, not here.
 */
export class AndroidAPIClientAdapter implements ApiClient {
    private readonly chainId: string;

    constructor(private readonly network: Network) {
        this.chainId = network.chainId;
    }

    getNetwork(): Network {
        return this.network;
    }

    async sendBoc(boc: Base64String): Promise<string> {
        return bridgeRequestSync('api.sendBoc', { chainId: this.chainId, boc });
    }

    async runGetMethod(
        address: UserFriendlyAddress,
        method: string,
        stack?: RawStackItem[],
        seqno?: number,
    ): Promise<GetMethodResult> {
        return bridgeRequestSyncTyped<GetMethodResult>('api.runGetMethod', {
            chainId: this.chainId,
            address,
            method,
            stack,
            seqno,
        });
    }

    async getMasterchainInfo(): Promise<MasterchainInfo> {
        return bridgeRequestSyncTyped<MasterchainInfo>('api.getMasterchainInfo', { chainId: this.chainId });
    }

    async nftItemsByAddress(request: NFTsRequest): Promise<NFTsResponse> {
        return bridgeRequestSyncTyped<NFTsResponse>('api.nftItemsByAddress', { chainId: this.chainId, request });
    }

    async nftItemsByOwner(request: UserNFTsRequest): Promise<NFTsResponse> {
        return bridgeRequestSyncTyped<NFTsResponse>('api.nftItemsByOwner', { chainId: this.chainId, request });
    }

    async fetchEmulation(messageBoc: Base64String, ignoreSignature?: boolean): Promise<EmulationResult> {
        return bridgeRequestSyncTyped<EmulationResult>('api.fetchEmulation', {
            chainId: this.chainId,
            messageBoc,
            ignoreSignature,
        });
    }

    async getAccountState(address: UserFriendlyAddress, seqno?: number): Promise<AccountState> {
        return bridgeRequestSyncTyped<AccountState>('api.getAccountState', {
            chainId: this.chainId,
            address,
            seqno,
        });
    }

    async getAccountStates(addresses: UserFriendlyAddress[]): Promise<AccountStates> {
        return bridgeRequestSyncTyped<AccountStates>('api.getAccountStates', {
            chainId: this.chainId,
            addresses,
        });
    }

    async getBalance(address: UserFriendlyAddress, seqno?: number): Promise<TokenAmount> {
        return bridgeRequestSync('api.getBalance', { chainId: this.chainId, address, seqno }) as TokenAmount;
    }

    async resolveDnsWallet(domain: string): Promise<string | undefined> {
        const raw = bridgeRequestSync('api.resolveDnsWallet', { chainId: this.chainId, domain });
        return raw || undefined;
    }

    async backResolveDnsWallet(address: UserFriendlyAddress): Promise<string | undefined> {
        const raw = bridgeRequestSync('api.backResolveDnsWallet', { chainId: this.chainId, address });
        return raw || undefined;
    }

    async getAccountTransactions(_request: TransactionsByAddressRequest): Promise<TransactionsResponse> {
        throw new Error('getAccountTransactions is not implemented yet');
    }

    async getTransactionsByHash(_request: GetTransactionByHashRequest): Promise<TransactionsResponse> {
        throw new Error('getTransactionsByHash is not implemented yet');
    }

    async getPendingTransactions(_request: GetPendingTransactionsRequest): Promise<TransactionsResponse> {
        throw new Error('getPendingTransactions is not implemented yet');
    }

    async getTrace(_request: GetTraceRequest): Promise<ToncenterTracesResponse> {
        throw new Error('getTrace is not implemented yet');
    }

    async getPendingTrace(_request: GetPendingTraceRequest): Promise<ToncenterTracesResponse> {
        throw new Error('getPendingTrace is not implemented yet');
    }

    async jettonsByAddress(_request: GetJettonsByAddressRequest): Promise<ToncenterResponseJettonMasters> {
        throw new Error('jettonsByAddress is not implemented yet');
    }

    async jettonsByOwnerAddress(_request: GetJettonsByOwnerRequest): Promise<JettonsResponse> {
        throw new Error('jettonsByOwnerAddress is not implemented yet');
    }

    async getEvents(_request: GetEventsRequest): Promise<GetEventsResponse> {
        throw new Error('getEvents is not implemented yet');
    }
}
