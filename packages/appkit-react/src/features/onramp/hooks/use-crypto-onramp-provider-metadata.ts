/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use client';

import { useMemo } from 'react';
import { getCryptoOnrampProviderMetadata } from '@ton/appkit';
import type { GetCryptoOnrampProviderMetadataOptions, GetCryptoOnrampProviderMetadataReturnType } from '@ton/appkit';

import { useAppKit } from '../../settings';
import { useCryptoOnrampProviders } from './use-crypto-onramp-providers';

export type UseCryptoOnrampProviderMetadataParameters = GetCryptoOnrampProviderMetadataOptions;

export type UseCryptoOnrampProviderMetadataReturnType = GetCryptoOnrampProviderMetadataReturnType | undefined;

/**
 * Hook to get static metadata for a crypto-onramp provider (display name, logo, url).
 *
 * Metadata is static, so this resolves synchronously off the registered providers — no query.
 * Returns `undefined` when no provider matches (e.g. before registration or for an unknown id);
 * subscribing to the provider list keeps the value fresh as providers register or the default changes.
 */
export const useCryptoOnrampProviderMetadata = (
    parameters: UseCryptoOnrampProviderMetadataParameters = {},
): UseCryptoOnrampProviderMetadataReturnType => {
    const appKit = useAppKit();
    const providers = useCryptoOnrampProviders();
    const { providerId } = parameters;

    return useMemo(() => {
        if (providers.length === 0) return undefined;
        if (providerId && !providers.some((provider) => provider.providerId === providerId)) return undefined;
        return getCryptoOnrampProviderMetadata(appKit, { providerId });
    }, [appKit, providers, providerId]);
};
