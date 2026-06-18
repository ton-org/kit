/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * Per-request options accepted by every {@link ApiClient} method as an optional
 * trailing argument. Designed to grow — retry overrides are added here later.
 */
export interface RequestOptions {
    /**
     * Aborts the in-flight request when triggered. Composed with the client's
     * internal `timeout`: whichever fires first wins. A caller-initiated abort
     * is never retried; a timeout may be (see retry config).
     */
    signal?: AbortSignal;
}
