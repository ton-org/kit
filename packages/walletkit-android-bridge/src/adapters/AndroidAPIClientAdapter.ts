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
    apiSendBoc: (paramsJson: string) => string;
    apiRunGetMethod: (paramsJson: string) => string;
    apiGetBalance: (paramsJson: string) => string;
    apiGetMasterchainInfo: (paramsJson: string) => string;
    apiNftItemsByAddress: (paramsJson: string) => string;
    apiNftItemsByOwner: (paramsJson: string) => string;
    apiFetchEmulation: (paramsJson: string) => string;
    apiAccountState: (paramsJson: string) => string;
    apiAccountStates: (paramsJson: string) => string;
    apiResolveDnsWallet: (paramsJson: string) => string | undefined;
    apiBackResolveDnsWallet: (paramsJson: string) => string | undefined;
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
            return this.androidBridge.apiSendBoc(JSON.stringify({ network: this.network, boc }));
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
            const params = JSON.stringify({ network: this.network, address, method, stack, seqno });
            return JSON.parse(this.androidBridge.apiRunGetMethod(params)) as GetMethodResult;
        } catch (err) {
            error('[AndroidAPIClientAdapter] runGetMethod failed:', err);
            throw err;
        }
    }

    async nftItemsByAddress(request: NFTsRequest): Promise<NFTsResponse> {
        try {
            const params = JSON.stringify({ network: this.network, request });
            return JSON.parse(this.androidBridge.apiNftItemsByAddress(params)) as NFTsResponse;
        } catch (err) {
            error('[AndroidAPIClientAdapter] nftItemsByAddress failed:', err);
            throw err;
        }
    }

    async nftItemsByOwner(request: UserNFTsRequest): Promise<NFTsResponse> {
        try {
            const params = JSON.stringify({ network: this.network, request });
            return JSON.parse(this.androidBridge.apiNftItemsByOwner(params)) as NFTsResponse;
        } catch (err) {
            error('[AndroidAPIClientAdapter] nftItemsByOwner failed:', err);
            throw err;
        }
    }

    async fetchEmulation(messageBoc: Base64String, ignoreSignature?: boolean): Promise<EmulationResult> {
        try {
            const params = JSON.stringify({ network: this.network, messageBoc, ignoreSignature });
            return JSON.parse(this.androidBridge.apiFetchEmulation(params)) as EmulationResult;
        } catch (err) {
            error('[AndroidAPIClientAdapter] fetchEmulation failed:', err);
            throw err;
        }
    }

    async getAccountState(address: UserFriendlyAddress, seqno?: number): Promise<AccountState> {
        try {
            const params = JSON.stringify({ network: this.network, address, seqno });
            return JSON.parse(this.androidBridge.apiAccountState(params)) as AccountState;
        } catch (err) {
            error('[AndroidAPIClientAdapter] getAccountState failed:', err);
            throw err;
        }
    }

    async getAccountStates(addresses: UserFriendlyAddress[]): Promise<AccountStates> {
        try {
            const params = JSON.stringify({ network: this.network, addresses });
            return JSON.parse(this.androidBridge.apiAccountStates(params)) as AccountStates;
        } catch (err) {
            error('[AndroidAPIClientAdapter] getAccountStates failed:', err);
            throw err;
        }
    }

    async getBalance(address: UserFriendlyAddress, seqno?: number): Promise<TokenAmount> {
        try {
            const params = JSON.stringify({ network: this.network, address, seqno });
            return this.androidBridge.apiGetBalance(params);
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
            const params = JSON.stringify({ network: this.network, domain });
            return this.androidBridge.apiResolveDnsWallet(params) ?? undefined;
        } catch (err) {
            error('[AndroidAPIClientAdapter] resolveDnsWallet failed:', err);
            throw err;
        }
    }

    async backResolveDnsWallet(address: UserFriendlyAddress): Promise<string | undefined> {
        try {
            const params = JSON.stringify({ network: this.network, address });
            return this.androidBridge.apiBackResolveDnsWallet(params) ?? undefined;
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
            const params = JSON.stringify({ network: this.network });
            return JSON.parse(this.androidBridge.apiGetMasterchainInfo(params)) as MasterchainInfo;
        } catch (err) {
            error('[AndroidAPIClientAdapter] getMasterchainInfo failed:', err);
            throw err;
        }
    }
}
