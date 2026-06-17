/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useMemo } from 'react';
import type { CryptoOnrampProviderMetadata } from '@ton/appkit';

import { useCryptoOnrampProviders } from '../../../hooks/use-crypto-onramp-providers';

export type CryptoOnrampProvidersMetadata = Record<string, CryptoOnrampProviderMetadata | undefined>;

/**
 * Widget-local hook: metadata for every registered crypto-onramp provider, keyed by providerId.
 *
 * Provider metadata is static, so it resolves synchronously off the provider list from
 * {@link useCryptoOnrampProviders} — no queries. `isLoading` is always `false`; it is kept in the
 * return shape so consumers (and the widget context) don't have to special-case the metadata source.
 */
export const useCryptoOnrampProvidersWithMetadata = (): {
    metadataByProviderId: CryptoOnrampProvidersMetadata;
    isLoading: boolean;
} => {
    const providers = useCryptoOnrampProviders();

    const metadataByProviderId = useMemo<CryptoOnrampProvidersMetadata>(() => {
        const map: CryptoOnrampProvidersMetadata = {};
        for (const provider of providers) {
            map[provider.providerId] = provider.getMetadata();
        }
        return map;
    }, [providers]);

    return { metadataByProviderId, isLoading: false };
};
