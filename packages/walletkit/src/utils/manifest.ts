/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { CONNECT_EVENT_ERROR_CODES } from '@tonconnect/protocol';

import { isValidHost } from './url';
import { globalLogger } from '../core/Logger';
import type { ManifestFetchResult } from '../api/models/core/ManifestFetchResult';

const log = globalLogger.createChild('ManifestUtils');

export async function fetchManifest(manifestUrl: string, proxyUrl?: string): Promise<ManifestFetchResult> {
    try {
        // try to parse url
        const parsedUrl = new URL(manifestUrl);
        if (!isValidHost(parsedUrl.host)) {
            return {
                manifest: null,
                manifestFetchErrorCode: CONNECT_EVENT_ERROR_CODES.MANIFEST_NOT_FOUND_ERROR,
            };
        }
    } catch (_) {
        return {
            manifest: null,
            manifestFetchErrorCode: CONNECT_EVENT_ERROR_CODES.MANIFEST_NOT_FOUND_ERROR,
        };
    }

    // Try direct fetch first
    const directResult = await tryFetchManifest(manifestUrl);
    if (directResult.manifest) {
        return directResult;
    }

    if (!proxyUrl) {
        return {
            manifest: null,
            manifestFetchErrorCode: CONNECT_EVENT_ERROR_CODES.MANIFEST_CONTENT_ERROR,
        };
    }

    // If direct fetch failed, try via proxy
    log.info('Direct manifest fetch failed, trying proxy', { manifestUrl });
    const fetchProxyUrl = `${proxyUrl}${manifestUrl}`;
    return tryFetchManifest(fetchProxyUrl);
}

export async function tryFetchManifest(url: string): Promise<ManifestFetchResult> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            log.error('Failed to fetch manifest not ok', { url, status: response.status });
            return {
                manifest: null,
                manifestFetchErrorCode: CONNECT_EVENT_ERROR_CODES.MANIFEST_CONTENT_ERROR,
            };
        }
        const result = await response.json();
        return {
            manifest: result,
            manifestFetchErrorCode: undefined,
        };
    } catch (e) {
        log.error('Failed to fetch manifest catched', { url, error: e });
        return {
            manifest: null,
            manifestFetchErrorCode: CONNECT_EVENT_ERROR_CODES.MANIFEST_CONTENT_ERROR,
        };
    }
}
