/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

import type { GaslessProviderInterface } from '../../api/interfaces';
import type {
    Base64String,
    GaslessConfig,
    GaslessQuote,
    GaslessQuoteParams,
    GaslessSendParams,
    GaslessSendResponse,
    Hex,
} from '../../api/models';
import { Network } from '../../api/models';
import { EventEmitter } from '../../core/EventEmitter';
import type { ProviderFactoryContext } from '../../types/factory';
import { GaslessError, GaslessErrorCode } from './errors';
import { GaslessManager } from './GaslessManager';

const TEST_ADDRESS = 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs';

const makeProvider = (providerId: string): GaslessProviderInterface => ({
    type: 'gasless',
    providerId,
    getSupportedNetworks: () => [Network.mainnet()],
    getMetadata: vi.fn().mockResolvedValue({ name: 'Test', url: 'https://test.example' }),
    getConfig: vi.fn<(n: Network) => Promise<GaslessConfig>>().mockResolvedValue({
        relayAddress: TEST_ADDRESS,
        supportedAssets: [{ address: TEST_ADDRESS }],
    }),
    getQuote: vi.fn<(p: GaslessQuoteParams) => Promise<GaslessQuote>>().mockResolvedValue({
        network: Network.mainnet(),
        messages: [],
        fee: '0',
        validUntil: 0,
        relayAddress: TEST_ADDRESS,
        from: TEST_ADDRESS,
    }),
    sendTransaction: vi.fn<(p: GaslessSendParams) => Promise<GaslessSendResponse>>().mockResolvedValue({
        boc: 'AAA=' as Base64String,
        normalizedBoc: 'AAA=' as Base64String,
        normalizedHash: ('0x' + 'a'.repeat(64)) as Hex,
        internalBoc: 'AAA=' as Base64String,
    }),
});

const makeManager = (): { manager: GaslessManager; emitter: EventEmitter<never> } => {
    const emitter = new EventEmitter();
    const ctx: ProviderFactoryContext = {
        eventEmitter: emitter,
        networkManager: undefined as never,
    };
    const manager = new GaslessManager(() => ctx);
    return { manager, emitter: emitter as never };
};

describe('GaslessManager.registerProvider', () => {
    let manager: GaslessManager;

    beforeEach(() => {
        manager = makeManager().manager;
    });

    it('makes the first registered provider the default', () => {
        const provider = makeProvider('one');
        manager.registerProvider(provider);

        expect(manager.getProvider()).toBe(provider);
        expect(manager.getProviders()).toEqual([provider]);
    });

    it('keeps the first default when a second provider registers', () => {
        const first = makeProvider('first');
        const second = makeProvider('second');
        manager.registerProvider(first);
        manager.registerProvider(second);

        expect(manager.getProvider()).toBe(first);
        expect(manager.getProviders()).toEqual([first, second]);
    });

    it('replaces an existing provider with the same providerId', () => {
        const original = makeProvider('shared');
        const replacement = makeProvider('shared');
        manager.registerProvider(original);
        manager.registerProvider(replacement);

        expect(manager.getProvider()).toBe(replacement);
        expect(manager.getProviders()).toEqual([replacement]);
    });
});

describe('GaslessManager.setDefaultProvider', () => {
    it('switches the default to the requested providerId', () => {
        const { manager } = makeManager();
        const first = makeProvider('first');
        const second = makeProvider('second');
        manager.registerProvider(first);
        manager.registerProvider(second);

        manager.setDefaultProvider('second');

        expect(manager.getProvider()).toBe(second);
        expect(manager.getProvider('first')).toBe(first);
    });

    it('throws GaslessError when the providerId is not registered', () => {
        const { manager } = makeManager();
        manager.registerProvider(makeProvider('first'));

        expect(() => manager.setDefaultProvider('missing')).toThrow(GaslessError);
    });
});

describe('GaslessManager delegation', () => {
    it('forwards getMetadata to the default provider', async () => {
        const { manager } = makeManager();
        const provider = makeProvider('one');
        manager.registerProvider(provider);

        await expect(manager.getMetadata()).resolves.toEqual({ name: 'Test', url: 'https://test.example' });
        expect(provider.getMetadata).toHaveBeenCalledTimes(1);
    });

    it('forwards getConfig to the default provider', async () => {
        const { manager } = makeManager();
        const provider = makeProvider('one');
        manager.registerProvider(provider);

        await manager.getConfig();

        expect(provider.getConfig).toHaveBeenCalledTimes(1);
    });

    it('forwards getQuote to the named provider', async () => {
        const { manager } = makeManager();
        const a = makeProvider('a');
        const b = makeProvider('b');
        manager.registerProvider(a);
        manager.registerProvider(b);

        await manager.getQuote(
            {
                network: Network.mainnet(),
                feeAsset: TEST_ADDRESS,
                walletAddress: TEST_ADDRESS,
                walletPublicKey: '0xabc',
                messages: [{ address: TEST_ADDRESS, amount: '0' }],
            },
            'b',
        );

        expect(a.getQuote).not.toHaveBeenCalled();
        expect(b.getQuote).toHaveBeenCalledTimes(1);
    });

    it('forwards sendTransaction to the default provider', async () => {
        const { manager } = makeManager();
        const provider = makeProvider('one');
        manager.registerProvider(provider);

        await manager.sendTransaction({
            network: Network.mainnet(),
            walletPublicKey: '0xabc',
            internalBoc: 'AAA=' as never,
        });

        expect(provider.sendTransaction).toHaveBeenCalledTimes(1);
    });

    it('rethrows provider errors from getQuote without wrapping', async () => {
        const { manager } = makeManager();
        const provider = makeProvider('one');
        const error = new GaslessError('relayer down', GaslessErrorCode.QuoteFailed);
        (provider.getQuote as ReturnType<typeof vi.fn>).mockRejectedValueOnce(error);
        manager.registerProvider(provider);

        await expect(
            manager.getQuote({
                network: Network.mainnet(),
                feeAsset: TEST_ADDRESS,
                walletAddress: TEST_ADDRESS,
                walletPublicKey: '0xabc',
                messages: [{ address: TEST_ADDRESS, amount: '0' }],
            }),
        ).rejects.toBe(error);
    });
});

describe('GaslessManager events', () => {
    it('emits provider:registered when a new provider is added', () => {
        const { manager, emitter } = makeManager();
        const handler = vi.fn();
        (emitter as unknown as EventEmitter<{ 'provider:registered': { providerId: string; type: string } }>).on(
            'provider:registered',
            handler,
        );

        manager.registerProvider(makeProvider('one'));

        expect(handler).toHaveBeenCalledWith(
            expect.objectContaining({
                payload: expect.objectContaining({ providerId: 'one', type: 'gasless' }),
            }),
        );
    });

    it('emits provider:default-changed when the default switches', () => {
        const { manager, emitter } = makeManager();
        manager.registerProvider(makeProvider('first'));
        manager.registerProvider(makeProvider('second'));

        const handler = vi.fn();
        (emitter as unknown as EventEmitter<{ 'provider:default-changed': { providerId: string; type: string } }>).on(
            'provider:default-changed',
            handler,
        );

        manager.setDefaultProvider('second');

        expect(handler).toHaveBeenCalledTimes(1);
    });
});
