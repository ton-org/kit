/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { GaslessSendParams } from '../../../../api/models';
import { internalBocToExternalMessageBoc, stripHexPrefix } from '../utils';
import type { TonApiGaslessSendRequest } from '../types/send';

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
