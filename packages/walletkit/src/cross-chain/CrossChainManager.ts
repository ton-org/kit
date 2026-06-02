/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { SharedKitEvents } from '../types/emitter';
import type { ProviderFactoryContext, ProviderInput } from '../types/factory';
import { resolveProvider } from '../types';
import type { CrossChainManagerAPI, CrossChainProvider } from '../api/interfaces';
import type { EventEmitter } from '../core/EventEmitter';
import { CrossChainError } from './errors';
import { CrossChainErrorCode } from './errors';
import { globalLogger } from '../core/Logger';

const log = globalLogger.createChild('CrossChainManager');

/**
 * CrossChainManager - manages cross-chain providers and delegates cross-chain operations
 *
 * Allows registration of multiple cross-chain providers and provides a unified API
 * for cross-chain operations.
 */
export class CrossChainManager<E extends SharedKitEvents = SharedKitEvents> implements CrossChainManagerAPI {
    public createFactoryContext: () => ProviderFactoryContext<E>;

    protected providers: CrossChainProvider[] = [];
    protected eventEmitter: EventEmitter<E>;

    constructor(createFactoryContext: () => ProviderFactoryContext<E>) {
        this.createFactoryContext = createFactoryContext;
        this.eventEmitter = createFactoryContext().eventEmitter;
    }

    protected createError(message: string, code: string, details?: unknown) {
        log.error(message, { code, details });
        return new CrossChainError(message, code as CrossChainErrorCode, details);
    }

    /**
     * Register a provider. If another provider with the same id is already registered,
     * it is removed first and replaced by the new instance. Emits `provider:registered`.
     * @param {ProviderInput<CrossChainProvider>} input - Provider instance or factory that produces one
     * @throws {CrossChainError} if the resolved provider has no providerId
     */
    registerProvider(input: ProviderInput<CrossChainProvider>): void {
        const provider = resolveProvider(input, this.createFactoryContext());
        const providerId = provider.providerId;

        if (!providerId) {
            throw this.createError('Provider must have a providerId', CrossChainErrorCode.InvalidProvider);
        }

        const oldProvider = this.providers.find((p) => p.providerId === providerId);
        if (oldProvider) {
            this.removeProvider(oldProvider);
        }

        this.providers = [...this.providers, provider];

        this.eventEmitter.emit('provider:registered', { providerId, type: provider.type }, 'cross-chain-manager');
    }

    /**
     * Remove a previously registered provider. No-op if the provider is not registered.
     * The provider is matched by its `providerId`, so any instance with the same id will match.
     * @param {CrossChainProvider} provider - Provider instance to remove
     */
    removeProvider(provider: CrossChainProvider): void {
        const oldProvider = this.providers.find((p) => p.providerId === provider.providerId);

        if (oldProvider) {
            this.providers = this.providers.filter((p) => p !== oldProvider);
        }
    }

    /**
     * Get a provider by name, or the default provider
     * @param {string} providerId - Optional provider name
     * @returns {CrossChainProvider} Provider instance
     * @throws {CrossChainError} if provider not found or no default set
     */
    getProvider(providerId: string): CrossChainProvider {
        if (!providerId) {
            throw this.createError(
                'No default provider set. Register a provider first.',
                CrossChainErrorCode.NoDefaultProvider,
            );
        }

        const provider = this.providers.find((p) => p.providerId === providerId);
        if (!provider) {
            throw this.createError(`Provider '${providerId}' not found`, CrossChainErrorCode.ProviderNotFound, {
                provider: providerId,
                registered: this.providers.map((p) => p.providerId),
            });
        }

        return provider;
    }

    /**
     * Get all registered providers. The returned array keeps a stable reference
     * until the provider list changes, so it can be safely used with React
     * subscription APIs like `useSyncExternalStore`.
     */
    getProviders(): CrossChainProvider[] {
        return this.providers;
    }

    /**
     * Check if a provider is registered
     * @param {string} providerId - Provider id
     * @returns {boolean} true if provider exists
     */
    hasProvider(providerId: string): boolean {
        return this.providers.some((p) => p.providerId === providerId);
    }
}
