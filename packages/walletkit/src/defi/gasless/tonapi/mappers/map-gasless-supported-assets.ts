/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { GaslessSupportedAsset } from '../../../../api/models';
import { asAddressFriendly } from '../../../../utils/address';
import type { TonApiGaslessConfig } from '../types/config';

export const mapGaslessSupportedAssets = (raw: TonApiGaslessConfig): GaslessSupportedAsset[] =>
    raw.gas_jettons.map((jetton) => ({
        address: asAddressFriendly(jetton.master_id),
    }));
