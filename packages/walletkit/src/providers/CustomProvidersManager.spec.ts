/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

import { EventEmitter } from '../core/EventEmitter';
import type { ProviderFactoryContext } from '../types/factory';
import type { SharedKitEvents } from '../types/emitter';
import type { CustomProvider } from './CustomProvider';
import { CustomProvidersManager } from './CustomProvidersManager';

interface TestProvider extends CustomProvider {
    customAction: () => Promise<void>;
}

const makeManager = (): { manager: CustomProvidersManager; emitter: EventEmitter<SharedKitEvents> } => {
    const emitter = new EventEmitter<SharedKitEvents>();
    const ctx: ProviderFactoryContext = {
        eventEmitter: emitter,
        networkManager: undefined as never,
    };
    return { manager: new CustomProvidersManager(() => ctx), emitter };
};

const makeProvider = (providerId: string): TestProvider => ({
    providerId,
    type: 'custom',
    customAction: vi.fn().mockResolvedValue(undefined),
});

describe('CustomProvidersManager', () => {
    let manager: CustomProvidersManager;

    beforeEach(() => {
        manager = makeManager().manager;
    });

    it('registers and retrieves a provider by id', () => {
        manager.registerProvider(makeProvider('my'));
        expect(manager.getProvider<TestProvider>('my')?.providerId).toBe('my');
    });

    it('returns undefined for an unknown provider', () => {
        expect(manager.getProvider('missing')).toBeUndefined();
    });

    it('resolves a provider factory using the factory context', () => {
        manager.registerProvider((ctx) => {
            expect(ctx.eventEmitter).toBeDefined();
            return makeProvider('from-factory');
        });
        expect(manager.hasProvider('from-factory')).toBe(true);
    });

    it('replaces a provider registered with the same id', () => {
        const second = makeProvider('dup');
        manager.registerProvider(makeProvider('dup'));
        manager.registerProvider(second);
        expect(manager.getProvider('dup')).toBe(second);
        expect(manager.getRegisteredProviders()).toEqual(['dup']);
    });

    it('lists all registered provider ids', () => {
        manager.registerProvider(makeProvider('a'));
        manager.registerProvider(makeProvider('b'));
        expect(manager.getRegisteredProviders()).toEqual(['a', 'b']);
    });

    it('reports whether a provider is registered', () => {
        expect(manager.hasProvider('x')).toBe(false);
        manager.registerProvider(makeProvider('x'));
        expect(manager.hasProvider('x')).toBe(true);
    });

    it('emits provider:registered on registration', () => {
        const { manager: mgr, emitter } = makeManager();
        const listener = vi.fn();
        emitter.on('provider:registered', listener);
        mgr.registerProvider(makeProvider('my'));
        expect(listener).toHaveBeenCalledTimes(1);
    });
});
