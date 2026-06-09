/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
    ApiClient,
    Base64String,
    UserFriendlyAddress,
    RawStackItem,
    GetMethodResult,
    NFTsRequest,
    NFTsResponse,
    UserNFTsRequest,
    TokenAmount,
    TransactionsResponse,
    JettonsResponse,
    AccountState,
    AccountStates,
    EmulationResult,
    ToncenterResponseJettonMasters,
    ToncenterTracesResponse,
    TransactionsByAddressRequest,
    GetTransactionByHashRequest,
    GetPendingTransactionsRequest,
    GetTraceRequest,
    GetPendingTraceRequest,
    GetJettonsByOwnerRequest,
    GetJettonsByAddressRequest,
    GetEventsRequest,
    GetEventsResponse,
    MasterchainInfo,
    Network,
} from '@ton/walletkit';

export class SwiftAPIClientAdapter implements ApiClient {
    private swiftApiClient: ApiClient;

    constructor(swiftApiClient: ApiClient) {
        this.swiftApiClient = swiftApiClient;
    }

    getNetwork(): Network {
        return this.swiftApiClient.getNetwork();
    }

    async sendBoc(boc: Base64String): Promise<string> {
        return this.swiftApiClient.sendBoc(boc);
    }

    async runGetMethod(
        address: UserFriendlyAddress,
        method: string,
        stack?: RawStackItem[],
        seqno?: number,
    ): Promise<GetMethodResult> {
        return this.swiftApiClient.runGetMethod(address, method, stack, seqno);
    }

    async nftItemsByAddress(request: NFTsRequest): Promise<NFTsResponse> {
        return this.swiftApiClient.nftItemsByAddress(request);
    }

    async nftItemsByOwner(request: UserNFTsRequest): Promise<NFTsResponse> {
        return this.swiftApiClient.nftItemsByOwner(request);
    }

    async fetchEmulation(messageBoc: Base64String, ignoreSignature?: boolean): Promise<EmulationResult> {
        return this.swiftApiClient.fetchEmulation(messageBoc, ignoreSignature);
    }

    async getAccountState(address: UserFriendlyAddress, seqno?: number): Promise<AccountState> {
        return this.swiftApiClient.getAccountState(address, seqno);
    }

    async getAccountStates(addresses: UserFriendlyAddress[]): Promise<AccountStates> {
        return this.swiftApiClient.getAccountStates(addresses);
    }

    async getBalance(address: UserFriendlyAddress, seqno?: number): Promise<TokenAmount> {
        return this.swiftApiClient.getBalance(address, seqno);
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

    async resolveDnsWallet(domain: string): Promise<string | undefined> {
        return this.swiftApiClient.resolveDnsWallet(domain);
    }

    async backResolveDnsWallet(address: UserFriendlyAddress): Promise<string | undefined> {
        return this.swiftApiClient.backResolveDnsWallet(address);
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

    async getMasterchainInfo(): Promise<MasterchainInfo> {
        return this.swiftApiClient.getMasterchainInfo();
    }
}
