/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { resolveProvider } from '../types';
import type { ProviderInput } from '../types';
import type { ProviderFactoryContext } from '../types/factory';
import type { SharedKitEvents } from '../types/emitter';
import type { EventEmitter } from '../core/EventEmitter';
import type { CustomProvider } from './CustomProvider';

/**
 * Registry for custom providers (`type: 'custom'`), keyed by `providerId`.
 *
 * Unlike the defi managers, a custom provider exposes no SDK-defined API.
 * Consumers register their own implementation and retrieve it by id, passing
 * the expected type as a generic argument to narrow the returned provider.
 */
export class CustomProvidersManager {
    public createFactoryContext: () => ProviderFactoryContext;

    private readonly providers = new Map<string, CustomProvider>();
    private readonly eventEmitter: EventEmitter<SharedKitEvents>;

    constructor(createFactoryContext: () => ProviderFactoryContext) {
        this.createFactoryContext = createFactoryContext;
        this.eventEmitter = createFactoryContext().eventEmitter;
    }

    /**
     * Register a custom provider. Replaces any existing provider with the same id.
     * Emits `provider:registered`.
     * @param input - Provider instance or factory that produces one
     */
    registerProvider<T extends CustomProvider>(input: ProviderInput<T>): void {
        const provider = resolveProvider(input, this.createFactoryContext());
        this.providers.set(provider.providerId, provider);
        this.eventEmitter.emit(
            'provider:registered',
            { providerId: provider.providerId, type: provider.type },
            'custom-providers-manager',
        );
    }

    /**
     * Get a registered custom provider by id.
     * @param providerId - Id the provider was registered under
     * @returns The provider when present, otherwise undefined
     */
    getProvider<T extends CustomProvider>(providerId: string): T | undefined {
        return this.providers.get(providerId) as T | undefined;
    }

    /**
     * Check if a custom provider is registered
     */
    hasProvider(providerId: string): boolean {
        return this.providers.has(providerId);
    }

    /**
     * Get the ids of all registered custom providers
     */
    getRegisteredProviders(): string[] {
        return Array.from(this.providers.keys());
    }
}
