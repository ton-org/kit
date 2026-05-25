/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Address, beginCell, Cell, internal, storeMessageRelaxed } from '@ton/core';

import type { Base64String } from '../../../api/models';
import { Network } from '../../../api/models';
import { GaslessErrorCode } from '../errors';
import { TonApiGaslessProvider, createTonApiGaslessProvider } from './TonApiGaslessProvider';

const TEST_ADDRESS = 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs';
const TEST_PUBKEY = '0x' + 'a'.repeat(64);

const buildSignedInternalBoc = (): Base64String => {
    const msg = internal({
        to: Address.parse(TEST_ADDRESS),
        value: 0n,
        body: beginCell().storeUint(1, 32).endCell(),
        bounce: false,
    });
    const cell = beginCell().store(storeMessageRelaxed(msg)).endCell();
    return cell.toBoc().toString('base64') as Base64String;
};

const jsonResponse = (body: unknown, init: { status?: number } = {}): Response => {
    return new Response(JSON.stringify(body), {
        status: init.status ?? 200,
        headers: { 'content-type': 'application/json' },
    });
};

const makeFetch = () => vi.fn<typeof fetch>();

const makeProvider = (
    fetchApi: ReturnType<typeof makeFetch>,
    overrides: Partial<Parameters<typeof createTonApiGaslessProvider>[0]> = {},
): TonApiGaslessProvider => {
    return new TonApiGaslessProvider({
        network: Network.mainnet(),
        fetchApi,
        sendRetries: 1,
        sendRetryDelayMs: 0,
        ...overrides,
    });
};

describe('TonApiGaslessProvider configuration', () => {
    it('defaults providerId to tonapi-${network.chainId}', () => {
        const provider = makeProvider(makeFetch());
        expect(provider.providerId).toBe(`tonapi-${Network.mainnet().chainId}`);
    });

    it('respects providerId override', () => {
        const provider = makeProvider(makeFetch(), { providerId: 'custom' });
        expect(provider.providerId).toBe('custom');
    });

    it('reports the configured network in getSupportedNetworks', () => {
        const provider = makeProvider(makeFetch(), { network: Network.testnet() });
        expect(provider.getSupportedNetworks()).toEqual([Network.testnet()]);
    });

    it('exposes "gasless" provider type', () => {
        const provider = makeProvider(makeFetch());
        expect(provider.type).toBe('gasless');
    });
});

describe('createTonApiGaslessProvider', () => {
    it('returns a factory producing a TonApiGaslessProvider', () => {
        const factory = createTonApiGaslessProvider({ network: Network.mainnet() });
        const provider = factory({} as never);
        expect(provider).toBeInstanceOf(TonApiGaslessProvider);
    });
});

describe('TonApiGaslessProvider.getConfig', () => {
    let fetchApi: ReturnType<typeof makeFetch>;
    let provider: TonApiGaslessProvider;

    beforeEach(() => {
        fetchApi = makeFetch();
        provider = makeProvider(fetchApi);
    });

    const rawConfig = (overrides: Record<string, unknown> = {}) => ({
        relay_address: Address.parse(TEST_ADDRESS).toRawString(),
        gas_jettons: [{ master_id: Address.parse(TEST_ADDRESS).toRawString() }],
        ...overrides,
    });

    it('maps the TonApi response to GaslessConfig', async () => {
        fetchApi.mockResolvedValueOnce(jsonResponse(rawConfig()));

        const cfg = await provider.getConfig();

        expect(cfg.relayAddress).toBe(Address.parse(TEST_ADDRESS).toString({ bounceable: true }));
        expect(cfg.supportedGasJettons).toHaveLength(1);
        expect(cfg.supportedGasJettons[0].jettonMaster).toBe(
            Address.parse(TEST_ADDRESS).toString({ bounceable: true }),
        );
    });

    it('hits /v2/gasless/config on the network endpoint', async () => {
        fetchApi.mockResolvedValueOnce(jsonResponse(rawConfig({ gas_jettons: [] })));

        await provider.getConfig();

        const url = (fetchApi.mock.calls[0][0] as URL).toString();
        expect(url).toBe('https://tonapi.io/v2/gasless/config');
    });

    it('uses the testnet endpoint for testnet provider', async () => {
        const testnetProvider = makeProvider(fetchApi, { network: Network.testnet() });
        fetchApi.mockResolvedValueOnce(jsonResponse(rawConfig({ gas_jettons: [] })));

        await testnetProvider.getConfig();

        expect((fetchApi.mock.calls[0][0] as URL).origin).toBe('https://testnet.tonapi.io');
    });

    it('sends Bearer authorization when apiKey is provided', async () => {
        const authedProvider = makeProvider(fetchApi, { apiKey: 'sk_test_123' });
        fetchApi.mockResolvedValueOnce(jsonResponse(rawConfig({ gas_jettons: [] })));

        await authedProvider.getConfig();

        const init = fetchApi.mock.calls[0][1] as RequestInit;
        const headers = init.headers as Headers;
        expect(headers.get('Authorization')).toBe('Bearer sk_test_123');
    });

    it('wraps fetch errors in GaslessError(CONFIG_FAILED)', async () => {
        fetchApi.mockResolvedValueOnce(new Response('boom', { status: 500 }));

        await expect(provider.getConfig()).rejects.toMatchObject({
            name: 'GaslessError',
            code: GaslessErrorCode.ConfigFailed,
        });
    });
});

describe('TonApiGaslessProvider.estimate', () => {
    let fetchApi: ReturnType<typeof makeFetch>;
    let provider: TonApiGaslessProvider;

    beforeEach(() => {
        fetchApi = makeFetch();
        provider = makeProvider(fetchApi);
    });

    const makeRawEstimate = (overrides: Record<string, unknown> = {}) => ({
        messages: [
            {
                address: Address.parse(TEST_ADDRESS).toRawString(),
                amount: '60000000',
                payload: beginCell().storeUint(99, 32).endCell().toBoc().toString('hex'),
            },
        ],
        commission: '1234',
        valid_until: 999999,
        relay_address: Address.parse(TEST_ADDRESS).toRawString(),
        from: Address.parse(TEST_ADDRESS).toRawString(),
        ...overrides,
    });

    it('maps relayer response to GaslessEstimateResult', async () => {
        fetchApi.mockResolvedValueOnce(jsonResponse(makeRawEstimate()));

        const result = await provider.estimate({
            feeJettonMaster: TEST_ADDRESS,
            walletAddress: TEST_ADDRESS,
            walletPublicKey: TEST_PUBKEY,
            messages: [{ address: TEST_ADDRESS, amount: '0' }],
        });

        expect(result.fee).toBe('1234');
        expect(result.validUntil).toBe(999999);
        expect(result.messages).toHaveLength(1);
        expect(result.messages[0].payload).toBeDefined();
        // Returned payload must be a valid base64 BoC
        expect(() => Cell.fromBase64(result.messages[0].payload as string)).not.toThrow();
    });

    it('strips 0x prefix from walletPublicKey and serializes BoCs as hex', async () => {
        fetchApi.mockResolvedValueOnce(jsonResponse(makeRawEstimate({ messages: [], commission: '0', validUntil: 0 })));

        await provider.estimate({
            feeJettonMaster: TEST_ADDRESS,
            walletAddress: TEST_ADDRESS,
            walletPublicKey: TEST_PUBKEY,
            messages: [{ address: TEST_ADDRESS, amount: '0' }],
        });

        const init = fetchApi.mock.calls[0][1] as RequestInit;
        const body = JSON.parse(init.body as string);
        expect(body.wallet_public_key).not.toMatch(/^0x/);
        expect(body.wallet_public_key).toBe('a'.repeat(64));
        expect(body.wallet_address).toBeDefined();
        expect(body.messages[0].boc).toMatch(/^[0-9a-f]+$/);
    });

    it('posts to /v2/gasless/estimate/{master_id}', async () => {
        fetchApi.mockResolvedValueOnce(
            jsonResponse(makeRawEstimate({ messages: [], commission: '0', valid_until: 0 })),
        );

        await provider.estimate({
            feeJettonMaster: TEST_ADDRESS,
            walletAddress: TEST_ADDRESS,
            walletPublicKey: TEST_PUBKEY,
            messages: [{ address: TEST_ADDRESS, amount: '0' }],
        });

        const url = (fetchApi.mock.calls[0][0] as URL).toString();
        expect(url).toContain('/v2/gasless/estimate/');
        const init = fetchApi.mock.calls[0][1] as RequestInit;
        expect(init.method).toBe('POST');
    });

    it('wraps fetch errors in GaslessError(ESTIMATE_FAILED)', async () => {
        fetchApi.mockResolvedValueOnce(new Response('relayer down', { status: 502 }));

        await expect(
            provider.estimate({
                feeJettonMaster: TEST_ADDRESS,
                walletAddress: TEST_ADDRESS,
                walletPublicKey: TEST_PUBKEY,
                messages: [{ address: TEST_ADDRESS, amount: '0' }],
            }),
        ).rejects.toMatchObject({
            name: 'GaslessError',
            code: GaslessErrorCode.EstimateFailed,
        });
    });
});

describe('TonApiGaslessProvider.send', () => {
    it('forwards a parsed external BoC (hex) to the relayer', async () => {
        const fetchApi = makeFetch();
        const provider = makeProvider(fetchApi);
        fetchApi.mockResolvedValueOnce(jsonResponse({}));

        await provider.send({ walletPublicKey: TEST_PUBKEY, internalBoc: buildSignedInternalBoc() });

        expect(fetchApi).toHaveBeenCalledTimes(1);
        const init = fetchApi.mock.calls[0][1] as RequestInit;
        const body = JSON.parse(init.body as string);
        expect(body.wallet_public_key).toBe('a'.repeat(64));
        expect(body.boc).toMatch(/^[0-9a-f]+$/);
    });

    it('retries on transient failure up to sendRetries', async () => {
        const fetchApi = makeFetch();
        const provider = makeProvider(fetchApi, { sendRetries: 3 });

        fetchApi
            .mockResolvedValueOnce(new Response('transient', { status: 500 }))
            .mockResolvedValueOnce(new Response('transient', { status: 500 }))
            .mockResolvedValueOnce(jsonResponse({}));

        await provider.send({ walletPublicKey: TEST_PUBKEY, internalBoc: buildSignedInternalBoc() });

        expect(fetchApi).toHaveBeenCalledTimes(3);
    });

    it('wraps persistent send errors in GaslessError(SEND_FAILED)', async () => {
        const fetchApi = makeFetch();
        const provider = makeProvider(fetchApi);
        fetchApi.mockResolvedValue(new Response('boom', { status: 500 }));

        await expect(
            provider.send({ walletPublicKey: TEST_PUBKEY, internalBoc: buildSignedInternalBoc() }),
        ).rejects.toMatchObject({
            name: 'GaslessError',
            code: GaslessErrorCode.SendFailed,
        });
    });
});
