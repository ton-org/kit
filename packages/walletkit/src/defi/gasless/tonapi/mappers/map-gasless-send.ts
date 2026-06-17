/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { GaslessSendParams, SendTransactionResponse } from '../../../../api/models';
import { asHex } from '../../../../utils/hex';
import { getNormalizedExtMessageHash } from '../../../../utils/getNormalizedExtMessageHash';
import { GaslessError, GaslessErrorCode } from '../../errors';
import { hexBocToBase64, internalBocToExternalMessageBoc, stripHexPrefix } from '../utils';
import type { TonApiGaslessSendRequest, TonApiGaslessSendResponse } from '../types/send';

/**
 * Domain → wire: build the JSON body for `POST /v2/gasless/send`.
 *
 * The signed internal-message BoC (returned by `wallet.signMessage`) is
 * unwrapped into an external message BoC that the relayer can broadcast.
 */
export const buildGaslessSendRequest = (params: GaslessSendParams): TonApiGaslessSendRequest => ({
    // `asHex` validates the public key before stripping the prefix.
    wallet_public_key: stripHexPrefix(asHex(params.walletPublicKey)),
    boc: internalBocToExternalMessageBoc(params.internalBoc).toBoc().toString('hex'),
});

/**
 * Wire → domain: turn TonAPI's `GaslessTx` response into a `SendTransactionResponse`.
 *
 * Despite the OpenAPI description ("Normalized hash of the external message"),
 * `external` is the **full hex BoC** of the external-in message the relayer
 * actually broadcast — verified against live TonAPI. Crucially it is the
 * *relayer's own* external message (addressed to the relayer's wallet), which
 * differs from the external message we submit (addressed to the user's wallet),
 * so it is the only source for the real on-chain hash. We re-encode it to base64
 * and normalize via `getNormalizedExtMessageHash` to yield the same
 * `{ boc, normalizedBoc, normalizedHash }` triple as `wallet.sendTransaction`.
 */
export const mapGaslessSend = (raw: TonApiGaslessSendResponse): SendTransactionResponse => {
    if (!raw.external) {
        throw new GaslessError('Relayer did not return the broadcasted external message', GaslessErrorCode.SendFailed, {
            protocolName: raw.protocol_name,
        });
    }

    try {
        const boc = hexBocToBase64(raw.external);
        const { hash: normalizedHash, boc: normalizedBoc } = getNormalizedExtMessageHash(boc);
        return { boc, normalizedBoc, normalizedHash };
    } catch (cause) {
        // Guards the OpenAPI-divergence risk: if TonAPI ever returns a bare hash
        // (or anything that isn't a parseable external-in BoC), fail loudly with a
        // typed error instead of crashing cryptically or returning a wrong hash.
        throw new GaslessError(
            'Relayer `external` is not a parseable external-message BoC — TonAPI response format may have changed.',
            GaslessErrorCode.SendFailed,
            { external: raw.external, cause },
        );
    }
};
