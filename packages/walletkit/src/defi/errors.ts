/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

export enum DefiErrorCode {
    ProviderNotFound = 'PROVIDER_NOT_FOUND',
    NoDefaultProvider = 'NO_DEFAULT_PROVIDER',
    NetworkError = 'NETWORK_ERROR',
    UnsupportedNetwork = 'UNSUPPORTED_NETWORK',
    InvalidParams = 'INVALID_PARAMS',
    InvalidProvider = 'INVALID_PROVIDER',
    Unknown = 'UNKNOWN',
}

export class DefiError extends Error {
    public readonly code: string;
    public readonly details?: unknown;

    constructor(message: string, code: string, details?: unknown) {
        super(message);
        this.name = 'DefiError';
        this.code = code;
        this.details = details;
    }
}

/**
 * Guarantees a typed error: returns `error` unchanged when it already is a {@link DefiError}
 * (including subclasses like `SwapError`, `StakingError`, etc.), otherwise wraps it in a
 * `DefiError` with the {@link DefiErrorCode.Unknown} code. Use in manager catch blocks so the
 * public API always throws a `DefiError`.
 */
export function toDefiError(error: unknown, message: string): DefiError {
    return error instanceof DefiError ? error : new DefiError(message, DefiErrorCode.Unknown, error);
}
