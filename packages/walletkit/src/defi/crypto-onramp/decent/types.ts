/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * VM type identifier returned by the Decent API. Matches `vmId` from /getChainList.
 */
export type DecentVmId = 'evm' | 'solana' | 'alt-vm' | 'hypercore';

export type DecentSwapDirection = 'exact-amount-in' | 'exact-amount-out';

/**
 * Token / amount entry as returned by the Decent API (Payment object).
 */
export interface DecentPayment {
    chainId: number;
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    isNative: boolean;
    amount: string;
    usdAmount: number;
    logo: string | null;
    swapsXyzCode: string;
}

export interface DecentEvmTx {
    to: string;
    toExtra: string | null;
    value: string;
    chainId: number;
    chainKey: string;
}

export interface DecentBridgeRouteStep {
    srcChainId: number;
    dstChainId: number;
    srcBridgeToken: string;
    dstBridgeToken: string;
    bridgeId: string;
}

/**
 * Successful response of GET /api/getAction for actionType=swap-action.
 *
 * Non-exhaustive — only the fields we consume. `allRoutes` is an array of the
 * same shape and is not typed here.
 */
export interface DecentGetActionResponse {
    tx: DecentEvmTx;
    txId: string;
    vmId: DecentVmId;
    amountIn: DecentPayment;
    amountInMax: DecentPayment;
    amountOut: DecentPayment;
    amountOutMin: DecentPayment;
    protocolFee: DecentPayment;
    applicationFee: DecentPayment;
    bridgeFee: DecentPayment;
    bridgeIds: string[];
    bridgeRoute: DecentBridgeRouteStep[];
    exchangeRate: number;
    estimatedTxTime: number;
    estimatedPriceImpact: number;
    requiresTokenApproval: boolean;
    executionsType: 'DEFAULT' | 'GASLESS';
}

/**
 * Token info entry as returned in `paths[].tokens` from `/getPaths`.
 */
export interface DecentTokenInfo {
    chainId: number;
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    isNative: boolean;
    logo: string | null;
    swapsXyzCode?: string;
}

export interface DecentChainPath {
    chainId: number;
    /** Either the literal string `'all'` or a concrete list of supported tokens. */
    tokens: 'all' | DecentTokenInfo[];
    supportsExactAmountIn?: boolean;
    supportsExactAmountOut?: boolean;
}

export interface DecentGetPathsResponse {
    srcChainId: number;
    srcToken: DecentTokenInfo;
    paths: DecentChainPath[];
    timestamp: string;
}

export interface DecentErrorResponse {
    success: false;
    error: {
        code: string;
        name: string;
        message: string;
        title: string;
        statusCode: number;
        details?: unknown;
        timestamp: string;
    };
}
