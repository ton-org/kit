/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { describe, expect, it, vi } from 'vitest';

import { BaseApiClient } from './BaseApiClient';
import type { BaseApiClientConfig } from './BaseApiClient';
import { ApiClientTimeoutError } from './errors';

class TestClient extends BaseApiClient {
    constructor(config: BaseApiClientConfig) {
        super(config, 'https://example.test');
    }
    protected appendAuthHeaders(): void {}
}

/** Resolves with a JSON response. */
const jsonFetch = (body: unknown, status = 200): typeof fetch =>
    (async () =>
        new Response(JSON.stringify(body), {
            status,
            headers: { 'content-type': 'application/json' },
        })) as typeof fetch;

/** Never resolves on its own — only rejects (with the abort reason) once its signal aborts. */
const hangingFetch = (): typeof fetch =>
    ((_input: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
            const signal = init?.signal;
            signal?.addEventListener(
                'abort',
                () => reject(signal.reason ?? new DOMException('Aborted', 'AbortError')),
                {
                    once: true,
                },
            );
        })) as typeof fetch;

describe('BaseApiClient', () => {
    it('returns parsed JSON on success', async () => {
        const client = new TestClient({ fetchApi: jsonFetch({ ok: 1 }), timeout: 1000 });
        await expect(client.getJson('/x')).resolves.toEqual({ ok: 1 });
    });

    it('throws ApiClientTimeoutError when the request exceeds the timeout', async () => {
        const client = new TestClient({ fetchApi: hangingFetch(), timeout: 10 });
        await expect(client.getJson('/x')).rejects.toBeInstanceOf(ApiClientTimeoutError);
    });

    it('propagates a caller abort without converting it to a timeout', async () => {
        const controller = new AbortController();
        const client = new TestClient({ fetchApi: hangingFetch(), timeout: 1000 });
        const promise = client.getJson('/x', undefined, { signal: controller.signal });
        controller.abort();
        await expect(promise).rejects.not.toBeInstanceOf(ApiClientTimeoutError);
    });

    it('aborts before touching the network when the signal is already aborted', async () => {
        const fetchApi = vi.fn(hangingFetch());
        const client = new TestClient({ fetchApi, timeout: 1000 });
        await expect(client.getJson('/x', undefined, { signal: AbortSignal.abort() })).rejects.toThrow();
        expect(fetchApi).not.toHaveBeenCalled();
    });
});
