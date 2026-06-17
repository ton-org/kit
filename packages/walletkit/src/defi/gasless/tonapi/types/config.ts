/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * Wire-format response from `GET /v2/gasless/config`.
 * See https://docs.tonapi.io/tonapi/rest-api/gasless.
 */
export interface TonApiGaslessConfig {
    relay_address: string;
    gas_jettons: TonApiGaslessGasJetton[];
}

export interface TonApiGaslessGasJetton {
    master_id: string;
}
