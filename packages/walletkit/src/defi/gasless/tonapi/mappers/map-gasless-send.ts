/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { GaslessSendParams, SendTransactionResponse } from '../../../../api/models';
import { asBase64 } from '../../../../utils/base64';
import { getNormalizedExtMessageHash } from '../../../../utils/getNormalizedExtMessageHash';
import { GaslessError, GaslessErrorCode } from '../../errors';
import { internalBocToExternalMessageBoc, stripHexPrefix } from '../utils';
import type { TonApiGaslessSendRequest, TonApiGaslessSendResponse } from '../types/send';

/**
 * Domain → wire: build the JSON body for `POST /v2/gasless/send`.
 *
 * The signed internal-message BoC (returned by `wallet.signMessage`) is
 * unwrapped into an external message BoC that the relayer can broadcast.
 */
export const buildGaslessSendRequest = (params: GaslessSendParams): TonApiGaslessSendRequest => ({
    wallet_public_key: stripHexPrefix(params.walletPublicKey),
    boc: internalBocToExternalMessageBoc(params.internalBoc).toBoc().toString('hex'),
});

/**
 * Wire → domain: turn TonAPI's `GaslessTx` response into a `SendTransactionResponse`.
 *
 * The OpenAPI description claims `external` is a "Normalized hash of the
 * external message", but the wire payload is actually the **full BoC** of the
 * external-in message the relayer broadcasted (hex-encoded). We re-encode it
 * to base64 and normalize via `getNormalizedExtMessageHash` so consumers get
 * the same `{ boc, normalizedBoc, normalizedHash }` triple as
 * `wallet.sendTransaction` returns.
 */
export const mapGaslessSend = (raw: TonApiGaslessSendResponse): SendTransactionResponse => {
    if (!raw.external) {
        throw new GaslessError('Relayer did not return the broadcasted external message', GaslessErrorCode.SendFailed, {
            protocolName: raw.protocol_name,
        });
    }

    const boc = asBase64(Buffer.from(raw.external, 'hex').toString('base64'));
    const { hash: normalizedHash, boc: normalizedBoc } = getNormalizedExtMessageHash(boc);
    return { boc, normalizedBoc, normalizedHash };
};
