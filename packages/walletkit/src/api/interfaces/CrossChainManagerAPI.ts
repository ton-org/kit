/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { ProviderInput } from '../../types';
import type { ProviderFactoryContext } from '../../types/factory';
import type { CrossChainProvider } from '../../cross-chain/CrossChainProvider';

/**
 * Cross-chain API interface exposed by CrossChainManager
 */
export interface CrossChainManagerAPI {
    createFactoryContext(): ProviderFactoryContext;
    /**
     * Register a new provider. If a provider with the same id is already registered, it is replaced.
     * @param provider Provider instance or factory (must produce a provider with providerId)
     */
    registerProvider(provider: ProviderInput<CrossChainProvider>): void;

    /**
     * Remove a previously registered provider. No-op if the provider was not registered.
     * @param provider Provider instance to remove (matched by providerId)
     */
    removeProvider(provider: CrossChainProvider): void;

    /**
     * Get a registered provider
     * @param providerId Provider identifier (optional, returns default if not specified)
     */
    getProvider(providerId?: string): CrossChainProvider;

    /**
     * Get all registered providers.
     * The returned array keeps a stable reference until the provider list changes.
     */
    getProviders(): CrossChainProvider[];

    /**
     * Check if a provider is registered
     * @param providerId Provider identifier
     */
    hasProvider(providerId: string): boolean;
}
