/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import type { SwapProviderMetadata } from '@ton/appkit';
import { getSwapProviderMetadataQueryOptions } from '@ton/appkit/queries';

import { useAppKit } from '../../../settings/hooks/use-app-kit';
import { useSwapProviders } from '../../hooks/use-swap-providers';

export type SwapProvidersMetadata = Record<string, SwapProviderMetadata | undefined>;

/**
 * Widget-local hook: fetch metadata for every registered swap provider, keyed by providerId.
 *
 * Uses {@link useSwapProviders} for the provider list and one TanStack query per provider via
 * `useQueries`. Each provider resolves independently — if one fails or is still pending, the
 * others remain visible. Consumers render every provider and fall back to `providerId` when
 * the entry in the map is `undefined`. `isLoading` is `true` while any metadata query is in
 * its first load.
 */
export const useSwapProvidersWithMetadata = (): {
    metadataByProviderId: SwapProvidersMetadata;
    isLoading: boolean;
} => {
    const appKit = useAppKit();
    const providers = useSwapProviders();

    const metadataQueries = useQueries({
        queries: providers.map((provider) =>
            getSwapProviderMetadataQueryOptions(appKit, { providerId: provider.providerId }),
        ),
    });

    const isLoading = metadataQueries.some((q) => q.isLoading);

    const metadataByProviderId = useMemo<SwapProvidersMetadata>(() => {
        const map: SwapProvidersMetadata = {};
        providers.forEach((provider, i) => {
            map[provider.providerId] = metadataQueries[i]?.data;
        });
        return map;
    }, [providers, metadataQueries]);

    return { metadataByProviderId, isLoading };
};
