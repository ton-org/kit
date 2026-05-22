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

import { error } from '../utils/logger';

type AndroidAPIClientBridge = {
    apiGetNetworks: () => string;
    apiSendBoc: (networkJson: string, boc: string) => string;
    apiRunGetMethod: (
        networkJson: string,
        address: string,
        method: string,
        stackJson: string | null,
        seqno: number,
    ) => string;
    apiGetBalance: (networkJson: string, address: string, seqno: number) => string;
    apiGetMasterchainInfo: (networkJson: string) => string;
    apiNftItemsByAddress: (networkJson: string, requestJson: string) => string;
    apiNftItemsByOwner: (networkJson: string, requestJson: string) => string;
    // ignoreSignature: -1 = missing, 0 = false, 1 = true
    apiFetchEmulation: (networkJson: string, messageBoc: string, ignoreSignature: number) => string;
    // seqno: -1 represents a missing optional
    apiAccountState: (networkJson: string, address: string, seqno: number) => string;
    apiAccountStates: (networkJson: string, addressesJson: string) => string;
    apiResolveDnsWallet: (networkJson: string, domain: string) => string | undefined;
    apiBackResolveDnsWallet: (networkJson: string, address: string) => string | undefined;
};

type AndroidWindow = Window & {
    WalletKitNative?: AndroidAPIClientBridge;
};

/**
 * Android native API client adapter.
 * Uses Android's JavascriptInterface methods for API calls.
 * Similar to SwiftAPIClientAdapter for iOS.
 */
export class AndroidAPIClientAdapter implements ApiClient {
    private androidBridge: AndroidAPIClientBridge;
    private network: Network;

    constructor(network: Network) {
        const androidWindow = window as AndroidWindow;
        if (!androidWindow.WalletKitNative) {
            throw new Error('WalletKitNative bridge not available');
        }
        this.androidBridge = androidWindow.WalletKitNative;
        this.network = network;
    }

    getNetwork(): Network {
        return this.network;
    }

    /**
     * Check if native API clients are available.
     */
    static isAvailable(): boolean {
        const androidWindow = window as AndroidWindow;
        return typeof androidWindow.WalletKitNative?.apiGetNetworks === 'function';
    }

    /**
     * Get all networks that have native API clients configured.
     */
    static getAvailableNetworks(): Network[] {
        const androidWindow = window as AndroidWindow;
        if (!androidWindow.WalletKitNative?.apiGetNetworks) {
            return [];
        }
        try {
            const networksJson = androidWindow.WalletKitNative.apiGetNetworks();
            return JSON.parse(networksJson) as Network[];
        } catch (err) {
            error('[AndroidAPIClientAdapter] Failed to get available networks:', err);
            return [];
        }
    }

    async sendBoc(boc: Base64String): Promise<string> {
        try {
            const networkJson = JSON.stringify(this.network);
            const result = this.androidBridge.apiSendBoc(networkJson, boc);
            return result;
        } catch (err) {
            error('[AndroidAPIClientAdapter] sendBoc failed:', err);
            throw err;
        }
    }

    async runGetMethod(
        address: UserFriendlyAddress,
        method: string,
        stack?: RawStackItem[],
        seqno?: number,
    ): Promise<GetMethodResult> {
        try {
            const networkJson = JSON.stringify(this.network);
            const stackJson = stack ? JSON.stringify(stack) : null;
            const seqnoArg = seqno ?? -1; // Use -1 to represent null
            const resultJson = this.androidBridge.apiRunGetMethod(networkJson, address, method, stackJson, seqnoArg);
            const result = JSON.parse(resultJson) as GetMethodResult;
            return result;
        } catch (err) {
            error('[AndroidAPIClientAdapter] runGetMethod failed:', err);
            throw err;
        }
    }

    async nftItemsByAddress(request: NFTsRequest): Promise<NFTsResponse> {
        try {
            const networkJson = JSON.stringify(this.network);
            const result = this.androidBridge.apiNftItemsByAddress(networkJson, JSON.stringify(request));
            return JSON.parse(result) as NFTsResponse;
        } catch (err) {
            error('[AndroidAPIClientAdapter] nftItemsByAddress failed:', err);
            throw err;
        }
    }

    async nftItemsByOwner(request: UserNFTsRequest): Promise<NFTsResponse> {
        try {
            const networkJson = JSON.stringify(this.network);
            const result = this.androidBridge.apiNftItemsByOwner(networkJson, JSON.stringify(request));
            return JSON.parse(result) as NFTsResponse;
        } catch (err) {
            error('[AndroidAPIClientAdapter] nftItemsByOwner failed:', err);
            throw err;
        }
    }

    async fetchEmulation(messageBoc: Base64String, ignoreSignature?: boolean): Promise<EmulationResult> {
        try {
            const networkJson = JSON.stringify(this.network);
            // -1 = missing, 0 = false, 1 = true (boolean can't cross JavascriptInterface cleanly).
            const flag = ignoreSignature === undefined ? -1 : ignoreSignature ? 1 : 0;
            const result = this.androidBridge.apiFetchEmulation(networkJson, messageBoc, flag);
            return JSON.parse(result) as EmulationResult;
        } catch (err) {
            error('[AndroidAPIClientAdapter] fetchEmulation failed:', err);
            throw err;
        }
    }

    async getAccountState(address: UserFriendlyAddress, seqno?: number): Promise<AccountState> {
        try {
            const networkJson = JSON.stringify(this.network);
            const seqnoArg = seqno ?? -1;
            const result = this.androidBridge.apiAccountState(networkJson, address, seqnoArg);
            return JSON.parse(result) as AccountState;
        } catch (err) {
            error('[AndroidAPIClientAdapter] getAccountState failed:', err);
            throw err;
        }
    }

    async getAccountStates(addresses: UserFriendlyAddress[]): Promise<AccountStates> {
        try {
            const networkJson = JSON.stringify(this.network);
            const result = this.androidBridge.apiAccountStates(networkJson, JSON.stringify(addresses));
            return JSON.parse(result) as AccountStates;
        } catch (err) {
            error('[AndroidAPIClientAdapter] getAccountStates failed:', err);
            throw err;
        }
    }

    async getBalance(address: UserFriendlyAddress, seqno?: number): Promise<TokenAmount> {
        try {
            const networkJson = JSON.stringify(this.network);
            // -1 represents a missing optional seqno (JS bridge can't pass `null` cleanly).
            const seqnoArg = seqno ?? -1;
            const result = this.androidBridge.apiGetBalance(networkJson, address, seqnoArg);
            return result;
        } catch (err) {
            error('[AndroidAPIClientAdapter] getBalance failed:', err);
            throw err;
        }
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
        try {
            const networkJson = JSON.stringify(this.network);
            return this.androidBridge.apiResolveDnsWallet(networkJson, domain) ?? undefined;
        } catch (err) {
            error('[AndroidAPIClientAdapter] resolveDnsWallet failed:', err);
            throw err;
        }
    }

    async backResolveDnsWallet(address: UserFriendlyAddress): Promise<string | undefined> {
        try {
            const networkJson = JSON.stringify(this.network);
            return this.androidBridge.apiBackResolveDnsWallet(networkJson, address) ?? undefined;
        } catch (err) {
            error('[AndroidAPIClientAdapter] backResolveDnsWallet failed:', err);
            throw err;
        }
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
        try {
            const networkJson = JSON.stringify(this.network);
            const resultJson = this.androidBridge.apiGetMasterchainInfo(networkJson);
            return JSON.parse(resultJson) as MasterchainInfo;
        } catch (err) {
            error('[AndroidAPIClientAdapter] getMasterchainInfo failed:', err);
            throw err;
        }
    }
}
