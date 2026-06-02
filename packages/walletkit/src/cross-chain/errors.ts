/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

export enum CrossChainErrorCode {
    ProviderNotFound = 'PROVIDER_NOT_FOUND',
    NetworkError = 'NETWORK_ERROR',
    UnsupportedNetwork = 'UNSUPPORTED_NETWORK',
    InvalidParams = 'INVALID_PARAMS',
    InvalidProvider = 'INVALID_PROVIDER',
    NoDefaultProvider = 'NO_DEFAULT_PROVIDER',
}

export class CrossChainError extends Error {
    public readonly code: string;
    public readonly details?: unknown;

    constructor(message: string, code: CrossChainErrorCode, details?: unknown) {
        super(message);
        this.name = 'CrossChainError';
        this.code = code;
        this.details = details;
    }
}
