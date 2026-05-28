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
import type { ProviderFactoryContext } from '../../../types/factory';
import { GaslessErrorCode } from '../errors';
import { TonApiGaslessProvider, createTonApiGaslessProvider } from './TonApiGaslessProvider';
import { internalBocToExternalMessageBoc } from './utils';

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

const ctxWith = (networks: Network[]): ProviderFactoryContext =>
    ({
        networkManager: {
            getConfiguredNetworks: () => networks,
        },
    }) as unknown as ProviderFactoryContext;

const makeProvider = (
    fetchApi: ReturnType<typeof makeFetch>,
    options: Partial<Parameters<typeof createTonApiGaslessProvider>[0]> & { networks?: Network[] } = {},
): TonApiGaslessProvider => {
    const { networks = [Network.mainnet()], ...config } = options;
    return TonApiGaslessProvider.createFromContext(ctxWith(networks), {
        fetchApi,
        sendRetries: 1,
        sendRetryDelayMs: 0,
        ...config,
    });
};

describe('TonApiGaslessProvider configuration', () => {
    it('defaults providerId to "tonapi"', () => {
        const provider = makeProvider(makeFetch());
        expect(provider.providerId).toBe('tonapi');
    });

    it('respects providerId override', () => {
        const provider = makeProvider(makeFetch(), { providerId: 'custom' });
        expect(provider.providerId).toBe('custom');
    });

    it('auto-registers all configured networks when chains is omitted', () => {
        const provider = makeProvider(makeFetch(), { networks: [Network.mainnet(), Network.testnet()] });
        expect(
            provider
                .getSupportedNetworks()
                .map((n) => n.chainId)
                .sort(),
        ).toEqual([Network.mainnet().chainId, Network.testnet().chainId].sort());
    });

    it('only registers chains that intersect with kit-configured networks', () => {
        const provider = makeProvider(makeFetch(), {
            networks: [Network.mainnet()],
            chains: {
                [Network.mainnet().chainId]: { apiKey: 'k1' },
                [Network.testnet().chainId]: { apiKey: 'k2' }, // not configured
            },
        });
        expect(provider.getSupportedNetworks()).toEqual([Network.mainnet()]);
    });

    it('throws when no networks are configured and no chains are passed', () => {
        expect(() => TonApiGaslessProvider.createFromContext(ctxWith([]), {})).toThrow(/no eligible networks/);
    });

    it('exposes "gasless" provider type', () => {
        const provider = makeProvider(makeFetch());
        expect(provider.type).toBe('gasless');
    });
});

describe('createTonApiGaslessProvider', () => {
    it('returns a factory producing a TonApiGaslessProvider', () => {
        const factory = createTonApiGaslessProvider({});
        const provider = factory(ctxWith([Network.mainnet()]));
        expect(provider).toBeInstanceOf(TonApiGaslessProvider);
    });
});

describe('TonApiGaslessProvider.getMetadata', () => {
    it('returns the static TonAPI provider metadata', async () => {
        const provider = makeProvider(makeFetch(), { networks: [Network.mainnet()] });

        await expect(provider.getMetadata()).resolves.toEqual({
            name: 'TonAPI',
            url: 'https://tonapi.io',
        });
    });
});

describe('TonApiGaslessProvider.getConfig', () => {
    let fetchApi: ReturnType<typeof makeFetch>;
    let provider: TonApiGaslessProvider;

    beforeEach(() => {
        fetchApi = makeFetch();
        provider = makeProvider(fetchApi, { networks: [Network.mainnet(), Network.testnet()] });
    });

    const rawConfig = (overrides: Record<string, unknown> = {}) => ({
        relay_address: Address.parse(TEST_ADDRESS).toRawString(),
        gas_jettons: [{ master_id: Address.parse(TEST_ADDRESS).toRawString() }],
        ...overrides,
    });

    it('maps the TonApi response to GaslessConfig (relayAddress + supportedAssets)', async () => {
        fetchApi.mockResolvedValueOnce(jsonResponse(rawConfig()));

        const config = await provider.getConfig(Network.mainnet());

        expect(config.relayAddress).toBe(Address.parse(TEST_ADDRESS).toString({ bounceable: true }));
        expect(config.supportedAssets).toHaveLength(1);
        expect(config.supportedAssets[0].address).toBe(Address.parse(TEST_ADDRESS).toString({ bounceable: true }));
    });

    it('hits /v2/gasless/config on the mainnet endpoint when called for mainnet', async () => {
        fetchApi.mockResolvedValueOnce(jsonResponse(rawConfig({ gas_jettons: [] })));

        await provider.getConfig(Network.mainnet());

        expect((fetchApi.mock.calls[0][0] as URL).toString()).toBe('https://tonapi.io/v2/gasless/config');
    });

    it('uses the testnet endpoint when called for testnet', async () => {
        fetchApi.mockResolvedValueOnce(jsonResponse(rawConfig({ gas_jettons: [] })));

        await provider.getConfig(Network.testnet());

        expect((fetchApi.mock.calls[0][0] as URL).origin).toBe('https://testnet.tonapi.io');
    });

    it('sends Bearer authorization when apiKey is configured for the chain', async () => {
        const authedProvider = makeProvider(fetchApi, {
            chains: { [Network.mainnet().chainId]: { apiKey: 'sk_test_123' } },
        });
        fetchApi.mockResolvedValueOnce(jsonResponse(rawConfig({ gas_jettons: [] })));

        await authedProvider.getConfig(Network.mainnet());

        const init = fetchApi.mock.calls[0][1] as RequestInit;
        const headers = init.headers as Headers;
        expect(headers.get('Authorization')).toBe('Bearer sk_test_123');
    });

    it('throws GaslessError(UNSUPPORTED_OPERATION) when called for a non-configured chain', async () => {
        const mainnetOnly = makeProvider(fetchApi, { networks: [Network.mainnet()] });

        await expect(mainnetOnly.getConfig(Network.testnet())).rejects.toMatchObject({
            name: 'GaslessError',
            code: GaslessErrorCode.UnsupportedOperation,
        });
    });

    it('wraps fetch errors in GaslessError(CONFIG_FAILED)', async () => {
        fetchApi.mockResolvedValueOnce(new Response('boom', { status: 500 }));

        await expect(provider.getConfig(Network.mainnet())).rejects.toMatchObject({
            name: 'GaslessError',
            code: GaslessErrorCode.ConfigFailed,
        });
    });

    it('serves repeated calls from the in-memory cache within TTL', async () => {
        fetchApi.mockResolvedValueOnce(jsonResponse(rawConfig()));

        const first = await provider.getConfig(Network.mainnet());
        const second = await provider.getConfig(Network.mainnet());

        expect(fetchApi).toHaveBeenCalledTimes(1);
        expect(second).toBe(first);
    });

    it('refetches after the cache TTL expires', async () => {
        const shortTtl = makeProvider(fetchApi, { configCacheTtlMs: 5 });
        fetchApi.mockResolvedValueOnce(jsonResponse(rawConfig())).mockResolvedValueOnce(jsonResponse(rawConfig()));

        await shortTtl.getConfig(Network.mainnet());
        await new Promise((resolve) => setTimeout(resolve, 20));
        await shortTtl.getConfig(Network.mainnet());

        expect(fetchApi).toHaveBeenCalledTimes(2);
    });

    it('deduplicates concurrent calls into one fetch', async () => {
        let resolveFetch: (response: Response) => void = () => {};
        fetchApi.mockImplementationOnce(
            () =>
                new Promise<Response>((resolve) => {
                    resolveFetch = resolve;
                }),
        );

        const a = provider.getConfig(Network.mainnet());
        const b = provider.getConfig(Network.mainnet());

        resolveFetch(jsonResponse(rawConfig()));

        const [resA, resB] = await Promise.all([a, b]);
        expect(fetchApi).toHaveBeenCalledTimes(1);
        expect(resA).toBe(resB);
    });

    it('does not cache failures — retries on the next call', async () => {
        fetchApi
            .mockResolvedValueOnce(new Response('boom', { status: 500 }))
            .mockResolvedValueOnce(jsonResponse(rawConfig()));

        await expect(provider.getConfig(Network.mainnet())).rejects.toMatchObject({
            code: GaslessErrorCode.ConfigFailed,
        });
        await expect(provider.getConfig(Network.mainnet())).resolves.toBeDefined();

        expect(fetchApi).toHaveBeenCalledTimes(2);
    });

    it('skips caching when configCacheTtlMs is 0', async () => {
        const noCache = makeProvider(fetchApi, { configCacheTtlMs: 0 });
        fetchApi.mockImplementation(async () => jsonResponse(rawConfig()));

        await noCache.getConfig(Network.mainnet());
        await noCache.getConfig(Network.mainnet());

        expect(fetchApi).toHaveBeenCalledTimes(2);
    });

    it('caches per-chain — mainnet and testnet have independent entries', async () => {
        fetchApi.mockResolvedValueOnce(jsonResponse(rawConfig())).mockResolvedValueOnce(jsonResponse(rawConfig()));

        await provider.getConfig(Network.mainnet());
        await provider.getConfig(Network.testnet());
        await provider.getConfig(Network.mainnet());
        await provider.getConfig(Network.testnet());

        expect(fetchApi).toHaveBeenCalledTimes(2);
    });
});

describe('TonApiGaslessProvider.getQuote', () => {
    let fetchApi: ReturnType<typeof makeFetch>;
    let provider: TonApiGaslessProvider;

    beforeEach(() => {
        fetchApi = makeFetch();
        provider = makeProvider(fetchApi);
    });

    const makeRawQuote = (overrides: Record<string, unknown> = {}) => ({
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

    const baseQuoteParams = {
        network: Network.mainnet(),
        feeAsset: TEST_ADDRESS,
        walletAddress: TEST_ADDRESS,
        walletPublicKey: TEST_PUBKEY,
        messages: [{ address: TEST_ADDRESS, amount: '0' }],
    };

    it('maps relayer response to GaslessQuote and threads network through', async () => {
        fetchApi.mockResolvedValueOnce(jsonResponse(makeRawQuote()));

        const result = await provider.getQuote(baseQuoteParams);

        expect(result.network).toEqual(Network.mainnet());
        expect(result.fee).toBe('1234');
        expect(result.validUntil).toBe(999999);
        expect(result.messages).toHaveLength(1);
        expect(() => Cell.fromBase64(result.messages[0].payload as string)).not.toThrow();
    });

    it('strips 0x prefix from walletPublicKey and serializes BoCs as hex', async () => {
        fetchApi.mockResolvedValueOnce(jsonResponse(makeRawQuote({ messages: [], commission: '0', valid_until: 0 })));

        await provider.getQuote(baseQuoteParams);

        const init = fetchApi.mock.calls[0][1] as RequestInit;
        const body = JSON.parse(init.body as string);
        expect(body.wallet_public_key).not.toMatch(/^0x/);
        expect(body.wallet_public_key).toBe('a'.repeat(64));
        expect(body.wallet_address).toBeDefined();
        expect(body.messages[0].boc).toMatch(/^[0-9a-f]+$/);
    });

    it('routes to the chain-specific endpoint based on params.network', async () => {
        const multiChain = makeProvider(fetchApi, { networks: [Network.mainnet(), Network.testnet()] });
        fetchApi.mockResolvedValueOnce(jsonResponse(makeRawQuote({ messages: [], commission: '0', valid_until: 0 })));

        await multiChain.getQuote({ ...baseQuoteParams, network: Network.testnet() });

        expect((fetchApi.mock.calls[0][0] as URL).origin).toBe('https://testnet.tonapi.io');
    });

    it('posts to /v2/gasless/estimate/{master_id}', async () => {
        fetchApi.mockResolvedValueOnce(jsonResponse(makeRawQuote({ messages: [], commission: '0', valid_until: 0 })));

        await provider.getQuote(baseQuoteParams);

        const url = (fetchApi.mock.calls[0][0] as URL).toString();
        expect(url).toContain('/v2/gasless/estimate/');
        const init = fetchApi.mock.calls[0][1] as RequestInit;
        expect(init.method).toBe('POST');
    });

    it('wraps fetch errors in GaslessError(QUOTE_FAILED)', async () => {
        fetchApi.mockResolvedValueOnce(new Response('relayer down', { status: 502 }));

        await expect(provider.getQuote(baseQuoteParams)).rejects.toMatchObject({
            name: 'GaslessError',
            code: GaslessErrorCode.QuoteFailed,
        });
    });

    it('maps TonAPI error_code 40000 to GaslessError(UNSUPPORTED_FEE_ASSET)', async () => {
        fetchApi.mockResolvedValueOnce(
            new Response(JSON.stringify({ error: 'Jetton is not supported.', error_code: 40000 }), {
                status: 400,
                headers: { 'content-type': 'application/json' },
            }),
        );

        await expect(provider.getQuote(baseQuoteParams)).rejects.toMatchObject({
            name: 'GaslessError',
            code: GaslessErrorCode.UnsupportedFeeAsset,
            message: 'Jetton is not supported.',
        });
    });

    it('maps TonAPI error_code 40007 to GaslessError(FEE_ASSET_NOT_OWNED)', async () => {
        fetchApi.mockResolvedValueOnce(
            new Response(
                JSON.stringify({
                    error: 'failed to resolve jetton master for jetton wallet 0:7742502c809ab1decdfcb82cd292b92a50be6ef823e6675ea541fce61bd1c88d',
                    error_code: 40007,
                }),
                { status: 400, headers: { 'content-type': 'application/json' } },
            ),
        );

        await expect(provider.getQuote(baseQuoteParams)).rejects.toMatchObject({
            name: 'GaslessError',
            code: GaslessErrorCode.FeeAssetNotOwned,
        });
    });

    it('throws GaslessError(UnsupportedOperation) when feeAsset is omitted', async () => {
        const fetchApi = makeFetch();
        const provider = makeProvider(fetchApi);

        await expect(
            provider.getQuote({
                network: Network.mainnet(),
                feeAsset: undefined,
                walletAddress: TEST_ADDRESS,
                walletPublicKey: TEST_PUBKEY,
                messages: [{ address: TEST_ADDRESS, amount: '0' }],
            }),
        ).rejects.toMatchObject({
            name: 'GaslessError',
            code: GaslessErrorCode.UnsupportedOperation,
        });
        expect(fetchApi).not.toHaveBeenCalled();
    });
});

describe('TonApiGaslessProvider.sendTransaction', () => {
    const baseSendParams = {
        network: Network.mainnet(),
        walletPublicKey: TEST_PUBKEY,
        internalBoc: buildSignedInternalBoc(),
    };

    // TonAPI's `external` is the hex BoC of the broadcasted external-in message.
    // The provider expects it to be present; build a valid one once and reuse.
    const validExternalHex = internalBocToExternalMessageBoc(buildSignedInternalBoc()).toBoc().toString('hex');
    const successfulSendResponse = () => jsonResponse({ protocol_name: 'tonapi', external: validExternalHex });

    it('forwards a parsed external BoC (hex) to the relayer', async () => {
        const fetchApi = makeFetch();
        const provider = makeProvider(fetchApi);
        fetchApi.mockResolvedValueOnce(successfulSendResponse());

        await provider.sendTransaction(baseSendParams);

        expect(fetchApi).toHaveBeenCalledTimes(1);
        const init = fetchApi.mock.calls[0][1] as RequestInit;
        const body = JSON.parse(init.body as string);
        expect(body.wallet_public_key).toBe('a'.repeat(64));
        expect(body.boc).toMatch(/^[0-9a-f]+$/);
    });

    it('parses the relayer-broadcast external BoC and returns a GaslessSendResponse', async () => {
        const fetchApi = makeFetch();
        const provider = makeProvider(fetchApi);
        // TonAPI's `external` is the hex-encoded BoC of the broadcast external-in message
        // (NOT a hash, despite the OpenAPI description). Reuse our helper to construct
        // one matching the wire format.
        const externalCell = internalBocToExternalMessageBoc(buildSignedInternalBoc());
        const externalHex = externalCell.toBoc().toString('hex');
        fetchApi.mockResolvedValueOnce(jsonResponse({ protocol_name: 'tonapi', external: externalHex }));

        const result = await provider.sendTransaction(baseSendParams);

        // All three SendTransactionResponse fields populated
        expect(result.boc).toBe(externalCell.toBoc().toString('base64'));
        expect(result.normalizedBoc).toBeDefined();
        expect(() => Cell.fromBase64(result.normalizedBoc)).not.toThrow();
        expect(result.normalizedHash).toMatch(/^0x[0-9a-f]{64}$/);
        // Plus the gasless-specific internalBoc echoed back from params
        expect(result.internalBoc).toBe(baseSendParams.internalBoc);
    });

    it('throws GaslessError(SEND_FAILED) when the relayer omits the external field', async () => {
        const fetchApi = makeFetch();
        const provider = makeProvider(fetchApi);
        fetchApi.mockResolvedValueOnce(jsonResponse({ protocol_name: 'tonapi' }));

        await expect(provider.sendTransaction(baseSendParams)).rejects.toMatchObject({
            name: 'GaslessError',
            code: GaslessErrorCode.SendFailed,
        });
    });

    it('routes to the chain-specific endpoint based on params.network', async () => {
        const fetchApi = makeFetch();
        const provider = makeProvider(fetchApi, { networks: [Network.mainnet(), Network.testnet()] });
        fetchApi.mockResolvedValueOnce(successfulSendResponse());

        await provider.sendTransaction({ ...baseSendParams, network: Network.testnet() });

        expect((fetchApi.mock.calls[0][0] as URL).origin).toBe('https://testnet.tonapi.io');
    });

    it('retries on transient 5xx failures up to sendRetries', async () => {
        const fetchApi = makeFetch();
        const provider = makeProvider(fetchApi, { sendRetries: 2 });

        fetchApi
            .mockResolvedValueOnce(new Response('transient', { status: 500 }))
            .mockResolvedValueOnce(new Response('transient', { status: 503 }))
            .mockResolvedValueOnce(successfulSendResponse());

        await provider.sendTransaction(baseSendParams);

        expect(fetchApi).toHaveBeenCalledTimes(3);
    });

    it('does NOT retry on 4xx client errors', async () => {
        const fetchApi = makeFetch();
        const provider = makeProvider(fetchApi, { sendRetries: 3 });
        fetchApi.mockResolvedValueOnce(
            new Response(JSON.stringify({ error: 'invalid signature' }), {
                status: 400,
                headers: { 'content-type': 'application/json' },
            }),
        );

        await expect(provider.sendTransaction(baseSendParams)).rejects.toMatchObject({
            name: 'GaslessError',
            code: GaslessErrorCode.SendFailed,
        });
        expect(fetchApi).toHaveBeenCalledTimes(1);
    });

    it('wraps persistent 5xx errors in GaslessError(SEND_FAILED) after exhausting retries', async () => {
        const fetchApi = makeFetch();
        const provider = makeProvider(fetchApi);
        fetchApi.mockResolvedValue(new Response('boom', { status: 500 }));

        await expect(provider.sendTransaction(baseSendParams)).rejects.toMatchObject({
            name: 'GaslessError',
            code: GaslessErrorCode.SendFailed,
        });
    });
});
