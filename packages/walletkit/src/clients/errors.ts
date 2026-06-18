/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * Base class for every error surfaced by the API clients. Catch this to handle
 * any client-originated failure uniformly; narrow to a subclass for specifics.
 */
export class ApiClientError extends Error {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);
        this.name = 'ApiClientError';
    }
}

/**
 * The server responded, but with a non-2xx status (or an unexpected body).
 * Carries the HTTP `status` and any parsed error `details`.
 */
export class ApiClientHttpError extends ApiClientError {
    public readonly status: number;
    public readonly details?: unknown;

    constructor(message: string, status: number, details?: unknown) {
        super(message);
        this.name = 'ApiClientHttpError';
        this.status = status;
        this.details = details;
    }
}

/**
 * The request did not complete within the configured `timeout`. Distinct from a
 * caller-initiated abort: a timeout is retryable (when `retryOnTimeout` is set),
 * an abort never is.
 */
export class ApiClientTimeoutError extends ApiClientError {
    public readonly timeoutMs?: number;

    constructor(message = 'Request timed out', timeoutMs?: number) {
        super(message);
        this.name = 'ApiClientTimeoutError';
        this.timeoutMs = timeoutMs;
    }
}

/**
 * The request never reached a response — a transport-level failure (DNS, refused
 * connection, offline, TLS). There is no HTTP status. The original `fetch`
 * `TypeError` is preserved as `cause`.
 */
export class ApiClientNetworkError extends ApiClientError {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);
        this.name = 'ApiClientNetworkError';
    }
}
