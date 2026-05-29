/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * Race a promise against a hard timeout. The returned promise rejects with a generic
 * timeout error if the input doesn't settle within {@link timeoutMs}.
 *
 * **Caveat**: this only frees the caller from waiting — it does NOT abort the underlying
 * operation. If the wrapped promise represents a network call or subscription, the work
 * continues in the background after timeout and its eventual settlement is discarded.
 * For real cancellation, the wrapped operation must support `AbortSignal` (and the
 * caller should pass one through directly, not via this helper).
 */
export const withTimeout = <T>(promise: PromiseLike<T>, timeoutMs: number): Promise<T> => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(`Execution timed out - ${timeoutMs}ms`)), timeoutMs);
    });
    return Promise.race([Promise.resolve(promise).finally(() => clearTimeout(timeoutId)), timeout]);
};
