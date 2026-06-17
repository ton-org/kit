/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { v7 as uuidv7 } from 'uuid';

import type { BridgePayload, WrappedFunctionRef } from '../types';
import { bigIntReplacer } from '../utils/serialization';
import { warn, error } from '../utils/logger';
import { sendToNative } from './port';

const pendingRequests = new Map<string, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();

export type BridgeFailureKind = 'bridge_unavailable' | 'native_threw' | 'decode_failed';

/** Structured failure for every bridge call. Distinguishes wire-level vs. host vs. decode. */
export class BridgeError extends Error {
    constructor(
        public readonly kind: BridgeFailureKind,
        public readonly method: string,
        options?: { cause?: unknown; raw?: string },
    ) {
        super(`[bridge:${kind}] ${method}${options?.raw ? ` raw=${truncate(options.raw)}` : ''}`);
        this.name = 'BridgeError';
        if (options?.cause !== undefined) (this as { cause?: unknown }).cause = options.cause;
    }
}

function truncate(s: string, max = 200): string {
    return s.length <= max ? s : `${s.slice(0, max)}…(${s.length} chars)`;
}

/** Sync host call via @JavascriptInterface — returns the raw string the host produced. */
export function bridgeRequestSync(method: string, params: Record<string, unknown>): string {
    const native = window.WalletKitNative;
    if (!native || typeof native.adapterCallSync !== 'function') {
        throw new BridgeError('bridge_unavailable', method);
    }
    try {
        return native.adapterCallSync(method, JSON.stringify(params, bigIntReplacer));
    } catch (cause) {
        throw new BridgeError('native_threw', method, { cause });
    }
}

/** Sync host call with JSON-parsed return. Optional [decode] runs after parse. */
export function bridgeRequestSyncTyped<T>(
    method: string,
    params: Record<string, unknown>,
    decode?: (parsed: unknown) => T,
): T {
    const raw = bridgeRequestSync(method, params);
    try {
        const parsed = JSON.parse(raw);
        return decode ? decode(parsed) : (parsed as T);
    } catch (cause) {
        throw new BridgeError('decode_failed', method, { cause, raw });
    }
}

export function isBridgeAvailable(): boolean {
    return typeof window.WalletKitNative?.adapterCallSync === 'function';
}

export function bridgeRequest(method: string, params: Record<string, unknown>): Promise<unknown> {
    const id = uuidv7();
    return new Promise<unknown>((resolve, reject) => {
        pendingRequests.set(id, { resolve, reject });
        postToNative({ kind: 'request', id, method, params });
    });
}

/**
 * Reconstructs a native callback that crossed the bridge as a WrappedFunctionRef into a callable.
 * The function itself can't be serialized, so the returned wrapper forwards its arguments through
 * the async `callByReference` reverse-RPC method. Returns undefined when there's no reference.
 * Wrappers are memoized under window.wrapped_funcs (keyed by reference id), not on global scope.
 */
export function unwrapRef(ref: WrappedFunctionRef | undefined): ((...args: unknown[]) => Promise<unknown>) | undefined {
    if (!ref?.__wrappedFn) {
        return undefined;
    }
    const refId = ref.__wrappedFn;
    const registry = window as unknown as {
        wrapped_funcs?: Record<string, (...args: unknown[]) => Promise<unknown>>;
    };
    registry.wrapped_funcs ??= {};
    registry.wrapped_funcs[refId] ??= (...args: unknown[]) => bridgeRequest('callByReference', { refId, args });
    return registry.wrapped_funcs[refId];
}

export function handleNativeResponse(id: string, resultJson: unknown, errorJson: unknown): void {
    const entry = pendingRequests.get(id);
    if (!entry) {
        warn('[walletkitBridge] handleNativeResponse: no pending request for id', id);
        return;
    }
    pendingRequests.delete(id);

    if (errorJson) {
        const err = errorJson as { message?: string };
        entry.reject(new Error(err.message ?? 'Native request failed'));
        return;
    }

    if (resultJson === null || resultJson === undefined) {
        entry.resolve(undefined);
        return;
    }

    if (typeof resultJson === 'string') {
        entry.resolve(JSON.parse(resultJson));
        return;
    }

    entry.resolve(resultJson);
}

export function postToNative(payload: BridgePayload): void {
    if (payload === null || (typeof payload !== 'object' && typeof payload !== 'function')) {
        const diagnostic = {
            type: typeof payload,
            value: payload,
            stack: new Error('postToNative non-object payload').stack,
        };
        error('[walletkitBridge] postToNative received non-object payload', diagnostic);
        throw new Error('Invalid payload - must be an object');
    }
    const json = JSON.stringify(payload, bigIntReplacer);
    sendToNative(json);
}
