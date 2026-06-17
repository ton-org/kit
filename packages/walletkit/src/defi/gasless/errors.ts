/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { DefiError } from '../errors';

export enum GaslessErrorCode {
    UnsupportedFeeAsset = 'UNSUPPORTED_FEE_ASSET',
    UnsupportedOperation = 'UNSUPPORTED_OPERATION',
    QuoteFailed = 'QUOTE_FAILED',
    SendFailed = 'SEND_FAILED',
    ConfigFailed = 'CONFIG_FAILED',
    SignMessageNotSupported = 'SIGN_MESSAGE_NOT_SUPPORTED',
    TooManyMessages = 'TOO_MANY_MESSAGES',
    QuoteExpired = 'QUOTE_EXPIRED',
    WalletMismatch = 'WALLET_MISMATCH',
    FeeAssetNotOwned = 'FEE_ASSET_NOT_OWNED',
}

export class GaslessError extends DefiError {
    public readonly code: GaslessErrorCode;

    constructor(message: string, code: GaslessErrorCode, details?: unknown) {
        super(message, code, details);
        this.name = 'GaslessError';
        this.code = code;
    }
}
