/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import type { CryptoOnrampProviderMetadata } from '@ton/appkit';
import { getCryptoOnrampProviderMetadataQueryOptions } from '@ton/appkit/queries';

import { useAppKit } from '../../../../settings/hooks/use-app-kit';
import { useCryptoOnrampProviders } from '../../../hooks/use-crypto-onramp-providers';

export type CryptoOnrampProvidersMetadata = Record<string, CryptoOnrampProviderMetadata | undefined>;

/**
 * Widget-local hook: fetch metadata for every registered crypto-onramp provider, keyed by providerId.
 *
 * Uses {@link useCryptoOnrampProviders} for the provider list and one TanStack query per provider
 * via `useQueries`. Each provider resolves independently — if one fails or is still pending, the
 * others remain visible. Consumers render every provider and fall back to `providerId` when the
 * entry in the map is `undefined`. `isLoading` is `true` while any metadata query is in its first
 * load.
 */
export const useCryptoOnrampProvidersWithMetadata = (): {
    metadataByProviderId: CryptoOnrampProvidersMetadata;
    isLoading: boolean;
} => {
    const appKit = useAppKit();
    const providers = useCryptoOnrampProviders();

    const metadataQueries = useQueries({
        queries: providers.map((provider) =>
            getCryptoOnrampProviderMetadataQueryOptions(appKit, { providerId: provider.providerId }),
        ),
    });

    const isLoading = metadataQueries.some((q) => q.isLoading);

    const metadataByProviderId = useMemo<CryptoOnrampProvidersMetadata>(() => {
        const map: CryptoOnrampProvidersMetadata = {};
        providers.forEach((provider, i) => {
            map[provider.providerId] = metadataQueries[i]?.data;
        });
        return map;
    }, [providers, metadataQueries]);

    return { metadataByProviderId, isLoading };
};
