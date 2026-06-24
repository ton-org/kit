/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
    CryptoOnrampDeposit,
    CryptoOnrampDepositParams,
    CryptoOnrampDestinationCurrency,
    CryptoOnrampQuote,
    CryptoOnrampQuoteParams,
    CryptoOnrampSourceCurrency,
    CryptoOnrampStatus,
    CryptoOnrampStatusParams,
    CryptoOnrampSupportedCurrencies,
} from '../../../api/models';
import { Network } from '../../../api/models';
import { CryptoOnrampProvider } from '../CryptoOnrampProvider';
import { CryptoOnrampError, CryptoOnrampErrorCode } from '../errors';
import { createProvider } from '../../../types/factory';
import type { LayerswapCreateSwapResponse, LayerswapGetSwapResponse, LayerswapNetwork, LayerswapToken } from './types';
import {
    DEFAULT_LAYERSWAP_SUPPORTED_CHAINS,
    LAYERSWAP_DESTINATION_NETWORK,
    LAYERSWAP_DESTINATION_TOKENS,
    formatBaseUnits,
    isErrorResponse,
    mapLayerswapErrorCode,
    mapStatus,
    parseBaseUnits,
    toLayerswapDestinationToken,
} from './utils';
import type { LayerswapChainConfig } from './utils';

const LAYERSWAP_API_URL = 'https://api.layerswap.io/api/v2';

export interface LayerswapProviderConfig {
    /**
     * Optional API key. Forwarded as `X-LS-APIKEY` when provided.
     */
    apiKey?: string;

    /**
     * Override the base API URL. Defaults to https://api.layerswap.io/api/v2
     */
    apiUrl?: string;

    /**
     * Mapping of CAIP-2 source chain identifiers to Layerswap network configs
     * (slug + refund-address regex). When omitted, defaults to
     * {@link DEFAULT_LAYERSWAP_SUPPORTED_CHAINS}. Pass a full map (not a partial)
     * — the override replaces the default. Spread the default to extend it.
     */
    supportedChains?: Record<string, LayerswapChainConfig>;

    /**
     * TON-side destination tokens that the provider asks Layerswap to route into.
     * Drives the `/sources` discovery used by `getSupportedCurrencies`. When omitted,
     * defaults to {@link LAYERSWAP_DESTINATION_TOKENS}. Pass a full list (not a partial)
     * — the override replaces the default. Spread the default to extend it.
     */
    destinationTokens?: CryptoOnrampDestinationCurrency[];
}

/**
 * Metadata stored on the CryptoOnrampQuote returned by this provider.
 *
 * The swap is created at quote time, so we cache the swap id and deposit
 * action here; `createDeposit` just reads them out.
 */
export interface LayerswapQuoteMetadata {
    swapId: string;
    depositAddress: string;
    sourceAmountBaseUnits: string;
    targetAmountBaseUnits: string;
    /** Source address used when the swap was created, if any. */
    sourceAddress?: string;
}

/**
 * Provider implementation that routes crypto onramps through Layerswap.
 *
 * The supported set of (chain, token) pairs is discovered at runtime via the
 * `/sources` endpoint. `getQuote` reads the symbol slug and decimals directly
 * from the caller-supplied `params.sourceCurrency` — no internal cache lookup.
 */
export class LayerswapCryptoOnrampProvider extends CryptoOnrampProvider<undefined, LayerswapQuoteMetadata> {
    readonly providerId = 'layerswap';

    getSupportedNetworks(): Network[] {
        return [Network.mainnet()];
    }

    getMetadata() {
        return {
            name: 'Layerswap',
            url: 'https://layerswap.io',
            isReversedAmountSupported: false,
            refundAddressMode: 'optional' as const,
        };
    }

    private readonly apiKey: string | undefined;
    private readonly apiUrl: string;
    private readonly supportedChains: Record<string, LayerswapChainConfig>;
    private readonly destinationTokens: CryptoOnrampDestinationCurrency[];

    constructor(config: LayerswapProviderConfig = {}) {
        super();
        this.apiKey = config.apiKey;
        this.apiUrl = config.apiUrl ?? LAYERSWAP_API_URL;
        this.supportedChains = config.supportedChains ?? DEFAULT_LAYERSWAP_SUPPORTED_CHAINS;
        this.destinationTokens = config.destinationTokens ?? LAYERSWAP_DESTINATION_TOKENS;
    }

    async getQuote(params: CryptoOnrampQuoteParams<undefined>): Promise<CryptoOnrampQuote<LayerswapQuoteMetadata>> {
        const { sourceCurrency, targetCurrency, recipientAddress, refundAddress } = params;

        const chainConfig = this.supportedChains[sourceCurrency.chain];
        if (!chainConfig) {
            throw new CryptoOnrampError(
                `Layerswap: unsupported source chain "${sourceCurrency.chain}"`,
                CryptoOnrampErrorCode.UnsupportedSourceChain,
                { supportedChains: Object.keys(this.supportedChains) },
            );
        }

        if (params.isSourceAmount === false) {
            throw new CryptoOnrampError(
                'Layerswap: only source-amount quotes are supported',
                CryptoOnrampErrorCode.ReversedAmountNotSupported,
            );
        }

        if (
            refundAddress !== undefined &&
            refundAddress !== '' &&
            !new RegExp(chainConfig.addressRegex).test(refundAddress)
        ) {
            throw new CryptoOnrampError(
                'Layerswap: refundAddress is not in the expected format (got "' + refundAddress + '")',
                CryptoOnrampErrorCode.InvalidRefundAddress,
            );
        }

        const amountDecimal = formatBaseUnits(params.amount, sourceCurrency.decimals);

        const body = {
            amount: amountDecimal,
            source_network: chainConfig.slug,
            destination_network: LAYERSWAP_DESTINATION_NETWORK,
            source_token: sourceCurrency.symbol,
            destination_token: toLayerswapDestinationToken(targetCurrency.symbol),
            destination_address: recipientAddress,
            ...(refundAddress ? { source_address: refundAddress } : {}),
            refuel: false,
            use_deposit_address: true,
        };

        let response: Response;
        try {
            response = await fetch(`${this.apiUrl}/swaps`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(this.apiKey ? { 'X-LS-APIKEY': this.apiKey } : {}),
                },
                body: JSON.stringify(body),
            });
        } catch (error) {
            throw new CryptoOnrampError(
                'Layerswap: network error while creating swap',
                CryptoOnrampErrorCode.QuoteFailed,
                error,
            );
        }

        const json = (await response.json().catch(() => undefined)) as LayerswapCreateSwapResponse | undefined;

        if (!response.ok || !json || isErrorResponse(json)) {
            const err = isErrorResponse(json) ? json.error : undefined;
            throw new CryptoOnrampError(
                err?.message ?? `Layerswap create swap failed (HTTP ${response.status})`,
                mapLayerswapErrorCode(err?.code, err?.message, CryptoOnrampErrorCode.QuoteFailed),
                err ?? { status: response.status },
            );
        }

        const data = json.data;
        const depositAction = data.deposit_actions[0];
        if (!depositAction) {
            throw new CryptoOnrampError(
                'Layerswap: swap was created but no deposit action was returned',
                CryptoOnrampErrorCode.QuoteFailed,
                data,
            );
        }

        const targetAmountBaseUnits = parseBaseUnits(data.quote.receive_amount, targetCurrency.decimals);
        const rate =
            data.quote.requested_amount > 0
                ? (data.quote.receive_amount / data.quote.requested_amount).toString()
                : '0';

        const metadata: LayerswapQuoteMetadata = {
            swapId: data.swap.id,
            depositAddress: depositAction.to_address,
            sourceAmountBaseUnits: depositAction.amount_in_base_units,
            targetAmountBaseUnits,
            sourceAddress: refundAddress || undefined,
        };

        return {
            sourceCurrency,
            targetCurrency,
            sourceAmount: metadata.sourceAmountBaseUnits,
            targetAmount: metadata.targetAmountBaseUnits,
            rate,
            recipientAddress,
            providerId: this.providerId,
            metadata,
        };
    }

    async createDeposit(params: CryptoOnrampDepositParams<LayerswapQuoteMetadata>): Promise<CryptoOnrampDeposit> {
        const metadata = params.quote.metadata;
        if (!metadata?.swapId) {
            throw new CryptoOnrampError(
                'Layerswap: quote metadata is missing — quote must be obtained from this provider',
                CryptoOnrampErrorCode.InvalidParams,
            );
        }

        const requestedAddress = params.refundAddress || undefined;
        if (requestedAddress !== metadata.sourceAddress) {
            const newQuote = await this.getQuote({
                amount: metadata.sourceAmountBaseUnits,
                sourceCurrency: params.quote.sourceCurrency,
                targetCurrency: params.quote.targetCurrency,
                recipientAddress: params.quote.recipientAddress,
                refundAddress: requestedAddress,
                isSourceAmount: true,
            });
            const newMetadata = newQuote.metadata;
            if (!newMetadata) {
                throw new CryptoOnrampError(
                    'Layerswap: quote metadata is missing — quote must be obtained from this provider',
                    CryptoOnrampErrorCode.InvalidParams,
                );
            }
            return {
                depositId: newMetadata.swapId,
                address: newMetadata.depositAddress,
                amount: newMetadata.sourceAmountBaseUnits,
                sourceCurrency: params.quote.sourceCurrency,
                providerId: this.providerId,
            };
        }

        return {
            depositId: metadata.swapId,
            address: metadata.depositAddress,
            amount: metadata.sourceAmountBaseUnits,
            sourceCurrency: params.quote.sourceCurrency,
            providerId: this.providerId,
        };
    }

    async getStatus(params: CryptoOnrampStatusParams): Promise<CryptoOnrampStatus> {
        const url = new URL(`${this.apiUrl}/swaps/${params.depositId}`);
        url.searchParams.set('exclude_deposit_actions', 'true');

        let response: Response;
        try {
            response = await fetch(url.toString(), {
                method: 'GET',
                headers: this.apiKey ? { 'X-LS-APIKEY': this.apiKey } : undefined,
            });
        } catch (error) {
            throw new CryptoOnrampError(
                'Layerswap: network error while fetching swap status',
                CryptoOnrampErrorCode.ProviderError,
                error,
            );
        }

        if (response.status === 404) {
            return 'pending';
        }

        const json = (await response.json().catch(() => undefined)) as LayerswapGetSwapResponse | undefined;

        if (!response.ok || !json || isErrorResponse(json)) {
            const err = isErrorResponse(json) ? json.error : undefined;
            throw new CryptoOnrampError(
                err?.message ?? `Layerswap get swap failed (HTTP ${response.status})`,
                mapLayerswapErrorCode(err?.code, err?.message, CryptoOnrampErrorCode.ProviderError),
                err ?? { status: response.status },
            );
        }

        return mapStatus(json.data.swap.status);
    }

    /**
     * Destination side is static (TON has a small, known set of supported tokens — Layerswap won't
     * surprise us there). For source, we query `/sources?destination_network=TON_MAINNET&destination_token=<sym>`
     * once per destination token. The endpoint only returns pairs that actually route through, so
     * subsequent `getQuote` calls won't run into `ROUTE_NOT_FOUND`. Multiple destination queries are
     * merged with dedup by `(chain, address)`.
     */
    async getSupportedCurrencies(): Promise<CryptoOnrampSupportedCurrencies> {
        const slugToCaip2 = buildSlugToCaip2Map(this.supportedChains);
        const destination = this.destinationTokens;

        const results = await Promise.allSettled(
            destination.map((dest) =>
                this.fetchSources(LAYERSWAP_DESTINATION_NETWORK, toLayerswapDestinationToken(dest.symbol)),
            ),
        );

        const sourceMap = new Map<string, CryptoOnrampSourceCurrency>();
        for (const result of results) {
            if (result.status !== 'fulfilled') continue;
            for (const network of result.value) {
                const caip2 = slugToCaip2[network.name];
                if (!caip2) continue;
                for (const token of network.tokens ?? []) {
                    if (token.status && token.status !== 'active') continue;
                    const mapped = mapLayerswapTokenToSource(token, caip2);
                    const key = `${mapped.chain}:${mapped.address.toLowerCase()}`;
                    if (!sourceMap.has(key)) sourceMap.set(key, mapped);
                }
            }
        }

        return { source: Array.from(sourceMap.values()), destination };
    }

    private async fetchSources(
        destinationNetwork: string,
        destinationToken: string,
    ): Promise<LayerswapNetworkWithTokens[]> {
        const url = new URL(`${this.apiUrl}/sources`);
        url.searchParams.set('destination_network', destinationNetwork);
        url.searchParams.set('destination_token', destinationToken);
        url.searchParams.set('has_deposit_address', 'true');

        let response: Response;
        try {
            response = await fetch(url.toString(), {
                method: 'GET',
                headers: this.apiKey ? { 'X-LS-APIKEY': this.apiKey } : undefined,
            });
        } catch (error) {
            throw new CryptoOnrampError(
                'Layerswap: network error while fetching sources',
                CryptoOnrampErrorCode.ProviderError,
                error,
            );
        }

        const json = (await response.json().catch(() => undefined)) as
            | { data?: LayerswapNetworkWithTokens[] }
            | undefined;

        if (!response.ok || !json || !Array.isArray(json.data)) {
            const err = isErrorResponse(json) ? json.error : undefined;
            throw new CryptoOnrampError(
                err?.message ?? `Layerswap /sources failed (HTTP ${response.status})`,
                mapLayerswapErrorCode(err?.code, err?.message, CryptoOnrampErrorCode.ProviderError),
                err ?? { status: response.status },
            );
        }

        return json.data;
    }
}

interface LayerswapNetworkWithTokens extends LayerswapNetwork {
    source_rank?: number;
    destination_rank?: number;
    tokens?: Array<
        LayerswapToken & {
            source_rank?: number;
            destination_rank?: number;
            contract: string | null;
            /** `/sources` marks each route token with a status string; we only keep `'active'`. */
            status?: string;
        }
    >;
}

const buildSlugToCaip2Map = (caip2ToConfig: Record<string, LayerswapChainConfig>): Record<string, string> => {
    const reversed: Record<string, string> = {};
    for (const [caip2, config] of Object.entries(caip2ToConfig)) reversed[config.slug] = caip2;
    return reversed;
};

const mapLayerswapTokenToSource = (
    token: LayerswapToken & { contract: string | null },
    caip2: string,
): CryptoOnrampSourceCurrency => ({
    chain: caip2,
    address: token.contract ?? 'native',
    symbol: token.symbol,
    name: token.display_asset ?? token.symbol,
    decimals: token.decimals,
    logo: token.logo ?? undefined,
});

/**
 * Returns a `ProviderFactory` for `LayerswapCryptoOnrampProvider`.
 * Pass to `providers: [createLayerswapProvider(config)]`.
 */
export const createLayerswapProvider = (config: LayerswapProviderConfig = {}) =>
    createProvider(() => new LayerswapCryptoOnrampProvider(config));
