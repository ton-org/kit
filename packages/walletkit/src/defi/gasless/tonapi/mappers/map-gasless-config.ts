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

export const mapGaslessConfig = (raw: TonApiGaslessConfig): GaslessConfig => ({
    relayAddress: asAddressFriendly(raw.relay_address),
    supportedGasJettons: raw.gas_jettons.map((jetton) => ({
        jettonMaster: asAddressFriendly(jetton.master_id),
    })),
});
