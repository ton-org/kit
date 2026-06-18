/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Network } from '../api/models';
import { combineSignals } from './combine-signals';
import { ApiClientHttpError, ApiClientTimeoutError } from './errors';
import type { RequestOptions } from './types';

export interface BaseApiClientConfig {
    endpoint?: string;
    apiKey?: string;
    timeout?: number;
    fetchApi?: typeof fetch;
    network?: Network;
    disableNetworkSend?: boolean;
}

export abstract class BaseApiClient {
    protected readonly endpoint: string;
    protected readonly apiKey?: string;
    protected readonly timeout: number;
    protected readonly fetchApi: typeof fetch;
    protected network: Network;
    protected readonly disableNetworkSend?: boolean;

    constructor(config: BaseApiClientConfig, defaultEndpoint: string) {
        this.network = config.network ?? Network.testnet();
        this.endpoint = config.endpoint ?? defaultEndpoint;
        this.apiKey = config.apiKey;
        this.timeout = config.timeout ?? 30000;
        this.fetchApi = config.fetchApi ?? fetch;
        this.disableNetworkSend = config.disableNetworkSend ?? false;
    }

    protected abstract appendAuthHeaders(headers: Headers): void;

    async fetch<T>(url: URL, props: globalThis.RequestInit = {}, opts: RequestOptions = {}): Promise<T> {
        const headers = new Headers(props.headers);
        headers.set('accept', 'application/json');
        this.appendAuthHeaders(headers);
        const response = await this.doRequest(url, { ...props, headers }, opts.signal);
        if (!response.ok) {
            throw await this.buildError(response);
        }
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
            const text = await (response as globalThis.Response).text();
            throw new ApiClientHttpError('Unexpected non-JSON response', response.status, text.slice(0, 200));
        }
        const json = await response.json();
        return json as Promise<T>;
    }

    async getJson<T>(path: string, query?: Record<string, unknown>, opts?: RequestOptions): Promise<T> {
        return this.fetch(this.buildUrl(path, query), { method: 'GET' }, opts);
    }

    async postJson<T>(path: string, props: unknown, opts?: RequestOptions): Promise<T> {
        return this.fetch(
            this.buildUrl(path),
            {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(props),
            },
            opts,
        );
    }

    protected buildUrl(path: string, query: Record<string, unknown> = {}): URL {
        const url = new URL(path.replace(/^\/*/, '/'), this.endpoint);
        for (const [key, value] of Object.entries(query)) {
            if (typeof value === 'string') url.searchParams.set(key, value);
            else if (Array.isArray(value)) {
                for (const item of value) {
                    if (typeof item === 'string') url.searchParams.append(key, item);
                    else if (item != null && typeof item.toString === 'function') {
                        url.searchParams.append(key, item.toString());
                    }
                }
            } else if (value != null && typeof value.toString === 'function') {
                url.searchParams.set(key, value.toString());
            }
        }
        return url;
    }

    protected async buildError(response: globalThis.Response): Promise<Error> {
        const message = response.statusText || 'HTTP Error';
        const code = response.status ?? 500;
        let detail: unknown;
        try {
            detail = await response.json();
        } catch {
            /* empty */
        }
        return new ApiClientHttpError(`HTTP ${response.status}: ${message}`, code, detail);
    }

    private async doRequest(
        url: URL,
        init: globalThis.RequestInit = {},
        externalSignal?: AbortSignal,
    ): Promise<globalThis.Response> {
        const fetchFn = this.fetchApi;

        // Bail out before touching the network if the caller already aborted.
        externalSignal?.throwIfAborted();

        const hasTimeout = this.timeout > 0;
        if (!hasTimeout) {
            return fetchFn(url, externalSignal ? { ...init, signal: externalSignal } : init);
        }

        // Fresh controller per attempt — a timeout aborts it, so it cannot be
        // reused once spent. A flag (not the abort reason) distinguishes a
        // timeout from a caller abort, so the underlying AbortError surfaces as
        // a typed ApiClientTimeoutError while the caller's abort propagates as-is.
        const controller = new AbortController();
        let timedOut = false;
        const timeoutId = setTimeout(() => {
            timedOut = true;
            controller.abort();
        }, this.timeout);

        try {
            return await fetchFn(url, { ...init, signal: combineSignals(externalSignal, controller.signal) });
        } catch (error) {
            if (timedOut) {
                throw new ApiClientTimeoutError(`Request timed out after ${this.timeout}ms`, this.timeout);
            }
            throw error;
        } finally {
            clearTimeout(timeoutId);
        }
    }
}
