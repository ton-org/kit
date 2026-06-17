/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Address } from '@ton/core';

import type { GaslessQuote, GaslessQuoteParams, Network } from '../../../../api/models';
import { asAddressFriendly } from '../../../../utils/address';
import { asHex } from '../../../../utils/hex';
import { buildInternalMessageCell, hexBocToBase64, stripHexPrefix } from '../utils';
import type { TonApiGaslessEstimateRequest, TonApiGaslessEstimateResponse } from '../types/estimate';

/**
 * Domain → wire: build the JSON body for `POST /v2/gasless/estimate/{master_id}`.
 *
 * Caller messages are encoded as hex BoCs of internal messages (TonAPI's wire format).
 */
export const buildGaslessQuoteRequest = (params: GaslessQuoteParams): TonApiGaslessEstimateRequest => ({
    wallet_address: Address.parse(params.walletAddress).toRawString(),
    // `asHex` validates the public key before stripping the prefix, so a
    // malformed key fails fast instead of flowing to the relayer.
    wallet_public_key: stripHexPrefix(asHex(params.walletPublicKey)),
    messages: params.messages.map((message) => ({
        boc: buildInternalMessageCell(message).toBoc().toString('hex'),
    })),
});

/**
 * Wire → domain: map the TonAPI estimate response to `GaslessQuote`.
 *
 * Hex BoCs in `payload` / `state_init` are converted back to base64. `network`
 * is threaded in from the request — the relayer does not echo it.
 */
export const mapGaslessQuote = (raw: TonApiGaslessEstimateResponse, network: Network): GaslessQuote => ({
    network,
    messages: raw.messages.map((message) => ({
        address: asAddressFriendly(message.address),
        amount: message.amount,
        payload: message.payload ? hexBocToBase64(message.payload) : undefined,
        stateInit: message.state_init ? hexBocToBase64(message.state_init) : undefined,
    })),
    fee: raw.commission,
    validUntil: raw.valid_until,
    from: asAddressFriendly(raw.from),
});
