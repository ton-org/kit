/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * Wire-format request body for `POST /v2/gasless/send`.
 * See https://docs.tonapi.io/tonapi/rest-api/gasless.
 */
export interface TonApiGaslessSendRequest {
    wallet_public_key: string;
    boc: string;
}

/**
 * Wire-format response from `POST /v2/gasless/send` (TonAPI `GaslessTx`).
 *
 * `external` is optional in the schema; `protocol_name` is required. The OpenAPI
 * labels `external` as a "normalized hash", but in practice (verified against
 * live TonAPI) it is the full hex BoC of the external-in message the relayer
 * broadcast — and it's the relayer's own message, distinct from the one we
 * submit, so it's the source of truth for the on-chain hash (see `mapGaslessSend`).
 */
export interface TonApiGaslessSendResponse {
    external?: string;
    protocol_name: string;
}
