/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { GaslessConfig } from '../../../../api/models';
import { asAddressFriendly } from '../../../../utils/address';
import type { TonApiGaslessConfig } from '../types/config';

/**
 * Wire → domain: map TonAPI's `/v2/gasless/config` response to `GaslessConfig`.
 * Bundles both the relay address (for jetton-transfer `responseDestination`)
 * and the assets the relayer accepts as fee payment.
 */
export const mapGaslessConfig = (raw: TonApiGaslessConfig): GaslessConfig => ({
    relayAddress: asAddressFriendly(raw.relay_address),
    supportedAssets: raw.gas_jettons.map((jetton) => ({
        address: asAddressFriendly(jetton.master_id),
    })),
});
