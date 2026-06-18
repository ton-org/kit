/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { Address } from '@ton/core';

import type { RequestOptions } from '../../clients/types';
import type { ToncenterResponseJettonMasters, ToncenterTracesResponse } from '../../types/toncenter/emulation';
import type { Event } from '../../types/toncenter/AccountEvent';
import type {
    AccountState,
    AccountStates,
    Base64String,
    UserNFTsRequest,
    NFTsRequest,
    NFTsResponse,
    TokenAmount,
    TransactionsResponse,
    UserFriendlyAddress,
    JettonsResponse,
    RawStackItem,
    GetMethodResult,
    MasterchainInfo,
    Network,
} from '../models';
import type { EmulationResult } from '../models';

export interface LimitRequest {
    limit?: number;
    offset?: number;
}

export interface NftItemsRequest {
    address?: Array<Address | string>;
}

export interface NftItemsByOwnerRequest extends LimitRequest {
    ownerAddress?: Array<Address | string>;
    sortByLastTransactionLt?: boolean;
}

export interface TransactionsByAddressRequest extends LimitRequest {
    address?: Array<Address | string>;
}

export type GetTransactionByHashRequest =
    | {
          msgHash: string;
      }
    | {
          bodyHash: string;
      };

export type GetPendingTransactionsRequest =
    | {
          accounts: Array<Address | string>;
      }
    | {
          traceId: Array<string>;
      };

export type GetTraceRequest = {
    account?: Address | string;
    traceId?: Array<string>;
};

export type GetPendingTraceRequest = {
    externalMessageHash: Array<string>;
};

export interface GetJettonsByOwnerRequest {
    ownerAddress: Address | string;
    offset?: number;
    limit?: number;
}

export interface GetJettonsByAddressRequest {
    address: UserFriendlyAddress;
    offset?: number;
    limit?: number;
}

export interface GetEventsRequest {
    account: Address | string;
    offset?: number;
    limit?: number;
}

export interface GetEventsResponse {
    events: Event[];
    offset: number;
    limit: number;
    hasNext: boolean;
}

export interface ApiClient {
    getNetwork(): Network;

    nftItemsByAddress(request: NFTsRequest, opts?: RequestOptions): Promise<NFTsResponse>;
    nftItemsByOwner(request: UserNFTsRequest, opts?: RequestOptions): Promise<NFTsResponse>;
    fetchEmulation(
        messageBoc: Base64String,
        ignoreSignature?: boolean,
        opts?: RequestOptions,
    ): Promise<EmulationResult>;
    sendBoc(boc: Base64String, opts?: RequestOptions): Promise<string>;
    runGetMethod(
        address: UserFriendlyAddress,
        method: string,
        stack?: RawStackItem[],
        seqno?: number,
        opts?: RequestOptions,
    ): Promise<GetMethodResult>; // TODO - Make serializable
    getAccountState(address: UserFriendlyAddress, seqno?: number, opts?: RequestOptions): Promise<AccountState>;

    /**
     * Fetches blockchain state for multiple accounts in a single batched request.
     *
     * Returns a Record keyed by canonical (bounceable) addresses, normalized via
     * `asAddressFriendly`. Every input address is guaranteed to have a key:
     * accounts that don't exist on chain are represented by an `AccountState`
     * with `status: 'non-existing'`.
     *
     * Throws synchronously on any invalid address format (no network call made).
     * Throws on any HTTP failure. Has no `seqno` parameter — bulk endpoints
     * of both toncenter and tonapi do not support historical state queries.
     */
    getAccountStates(addresses: UserFriendlyAddress[], opts?: RequestOptions): Promise<AccountStates>;

    getBalance(address: UserFriendlyAddress, seqno?: number, opts?: RequestOptions): Promise<TokenAmount>;

    getAccountTransactions(request: TransactionsByAddressRequest, opts?: RequestOptions): Promise<TransactionsResponse>;
    getTransactionsByHash(request: GetTransactionByHashRequest, opts?: RequestOptions): Promise<TransactionsResponse>;

    getPendingTransactions(
        request: GetPendingTransactionsRequest,
        opts?: RequestOptions,
    ): Promise<TransactionsResponse>;

    getTrace(request: GetTraceRequest, opts?: RequestOptions): Promise<ToncenterTracesResponse>;
    getPendingTrace(request: GetPendingTraceRequest, opts?: RequestOptions): Promise<ToncenterTracesResponse>;

    resolveDnsWallet(domain: string, opts?: RequestOptions): Promise<string | undefined>;
    backResolveDnsWallet(address: UserFriendlyAddress, opts?: RequestOptions): Promise<string | undefined>;

    jettonsByAddress(
        request: GetJettonsByAddressRequest,
        opts?: RequestOptions,
    ): Promise<ToncenterResponseJettonMasters>;
    jettonsByOwnerAddress(request: GetJettonsByOwnerRequest, opts?: RequestOptions): Promise<JettonsResponse>;

    getEvents(request: GetEventsRequest, opts?: RequestOptions): Promise<GetEventsResponse>;

    getMasterchainInfo(opts?: RequestOptions): Promise<MasterchainInfo>;
}
