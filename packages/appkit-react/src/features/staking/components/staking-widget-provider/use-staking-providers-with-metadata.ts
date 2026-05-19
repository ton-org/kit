/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import type { Network, StakingProviderMetadata } from '@ton/appkit';
import { getStakingProviderMetadataQueryOptions } from '@ton/appkit/queries';

import { useAppKit } from '../../../settings/hooks/use-app-kit';
import { useStakingProviders } from '../../hooks/use-staking-providers';

export type StakingProvidersMetadata = Record<string, StakingProviderMetadata | undefined>;

/**
 * Widget-local hook: fetch metadata for every registered staking provider, keyed by providerId.
 *
 * Uses {@link useStakingProviders} for the provider list and one TanStack query per provider via
 * `useQueries`. Each provider resolves independently — if one fails or is still pending, the
 * others remain visible. Consumers render every provider and fall back to `providerId` when
 * the entry in the map is `undefined`. Metadata is resolved for the given `network` (can vary
 * by chain). `isLoading` is `true` while any metadata query is in its first load.
 */
export const useStakingProvidersWithMetadata = (
    network?: Network,
): {
    metadataByProviderId: StakingProvidersMetadata;
    isLoading: boolean;
} => {
    const appKit = useAppKit();
    const providers = useStakingProviders();

    const metadataQueries = useQueries({
        queries: providers.map((provider) =>
            getStakingProviderMetadataQueryOptions(appKit, { providerId: provider.providerId, network }),
        ),
    });

    const isLoading = metadataQueries.some((q) => q.isLoading);

    const metadataByProviderId = useMemo<StakingProvidersMetadata>(() => {
        const map: StakingProvidersMetadata = {};
        providers.forEach((provider, i) => {
            map[provider.providerId] = metadataQueries[i]?.data;
        });
        return map;
    }, [providers, metadataQueries]);

    return { metadataByProviderId, isLoading };
};
