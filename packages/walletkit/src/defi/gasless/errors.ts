/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { DefiError } from '../errors';

export enum GaslessErrorCode {
    UnsupportedFeeJetton = 'UNSUPPORTED_FEE_JETTON',
    EstimateFailed = 'ESTIMATE_FAILED',
    SendFailed = 'SEND_FAILED',
    ConfigFailed = 'CONFIG_FAILED',
}

export class GaslessError extends DefiError {
    static readonly UNSUPPORTED_FEE_JETTON = GaslessErrorCode.UnsupportedFeeJetton;
    static readonly ESTIMATE_FAILED = GaslessErrorCode.EstimateFailed;
    static readonly SEND_FAILED = GaslessErrorCode.SendFailed;
    static readonly CONFIG_FAILED = GaslessErrorCode.ConfigFailed;

    constructor(message: string, code: string, details?: unknown) {
        super(message, code, details);
        this.name = 'GaslessError';
    }
}
