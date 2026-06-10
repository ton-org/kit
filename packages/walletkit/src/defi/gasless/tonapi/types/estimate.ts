/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * Wire-format request body for `POST /v2/gasless/estimate/{master_id}`.
 * See https://docs.tonapi.io/tonapi/rest-api/gasless.
 */
export interface TonApiGaslessEstimateRequest {
    wallet_address: string;
    wallet_public_key: string;
    messages: Array<{ boc: string }>;
}

/**
 * Wire-format response from `POST /v2/gasless/estimate/{master_id}`.
 */
export interface TonApiGaslessEstimateResponse {
    relay_address: string;
    commission: string;
    from: string;
    valid_until: number;
    messages: TonApiGaslessRawMessage[];
}

export interface TonApiGaslessRawMessage {
    address: string;
    amount: string;
    payload?: string;
    state_init?: string;
}
