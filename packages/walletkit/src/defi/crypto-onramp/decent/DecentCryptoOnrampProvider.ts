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
    CryptoOnrampQuote,
    CryptoOnrampQuoteParams,
    CryptoOnrampStatus,
    CryptoOnrampStatusParams,
    CryptoOnrampSupportedCurrencies,
} from '../../../api/models';
import { Network } from '../../../api/models';
import { CryptoOnrampProvider } from '../CryptoOnrampProvider';
import { CryptoOnrampError } from '../errors';
import { createProvider } from '../../../types/factory';
import type { DecentGetActionResponse, DecentSwapDirection } from './types';
import {
    DEFAULT_DECENT_SUPPORTED_CHAINS,
    DEFAULT_DECENT_SUPPORTED_CURRENCIES,
    isErrorResponse,
    isEvmAddress,
    mapStatus,
} from './utils';

// Decent (formerly Swaps.xyz) — they rebranded but kept the existing API endpoints.
const DECENT_API_URL = 'https://api-v2.swaps.xyz/api';
const TON_CHAIN_ID = 999000337;
const DEFAULT_SLIPPAGE_BPS = 100;
const DEFAULT_SENDER = '0x0000000000000000000000000000000000000000';

export interface DecentProviderConfig {
    /**
     * API key issued by Decent (passed as `x-api-key`)
     */
    apiKey: string;

    /**
     * Override the base API URL. Defaults to https://api-v2.swaps.xyz/api
     */
    apiUrl?: string;

    /**
     * EVM address used as `sender` on getAction requests. Required by the API
     * even for deposit flows where the actual payer is unknown. Defaults to a
     * null address when omitted.
     */
    defaultSender?: string;

    /**
     * Mapping of CAIP-2 source chain identifiers to Decent chain identifiers
     * (numeric chain id for EVM). When omitted, defaults to
     * {@link DEFAULT_DECENT_SUPPORTED_CHAINS}. Pass a full map (not a partial)
     * — the override replaces the default. Spread the default to extend it.
     */
    supportedChains?: Record<string, string>;

    /**
     * Curated supported-currencies list. Decent's API has no enumeration endpoint,
     * so the list is bundled statically. When omitted, defaults to
     * {@link DEFAULT_DECENT_SUPPORTED_CURRENCIES}. Spread the default to extend it.
     */
    supportedCurrencies?: CryptoOnrampSupportedCurrencies;
}

export interface DecentQuoteOptions {
    /**
     * Slippage tolerance in basis points (0-10000). Defaults to 100 (1%).
     */
    slippageBps?: number;
}

/**
 * Metadata stored on the CryptoOnrampQuote returned by this provider.
 *
 * The raw getAction response is kept here so that createDeposit can build a
 * CryptoOnrampDeposit without an extra network round-trip.
 */
export interface DecentQuoteMetadata {
    sender: string;
    response: DecentGetActionResponse;
}

/**
 * Provider implementation that routes crypto onramps through Decent.
 *
 * Supports EVM source chains only — quotes where the source chain's `vmId`
 * is not `evm` are rejected (non-EVM chains require a separate registerTxs
 * flow that we do not implement yet).
 */
export class DecentCryptoOnrampProvider extends CryptoOnrampProvider<DecentQuoteOptions, DecentQuoteMetadata> {
    readonly providerId = 'decent';

    getSupportedNetworks(): Network[] {
        return [Network.mainnet()];
    }

    getMetadata() {
        return { name: 'Decent', url: 'https://decent.xyz', refundAddressMode: 'required' as const };
    }

    private readonly apiKey: string;
    private readonly apiUrl: string;
    private readonly defaultSender: string;
    private readonly supportedChains: Record<string, string>;
    private readonly supportedCurrencies: CryptoOnrampSupportedCurrencies;

    constructor(config: DecentProviderConfig) {
        super();
        this.apiKey = config.apiKey;
        this.apiUrl = config.apiUrl ?? DECENT_API_URL;
        this.defaultSender = config.defaultSender ?? DEFAULT_SENDER;
        this.supportedChains = config.supportedChains ?? DEFAULT_DECENT_SUPPORTED_CHAINS;
        this.supportedCurrencies = config.supportedCurrencies ?? DEFAULT_DECENT_SUPPORTED_CURRENCIES;
    }

    async getQuote(
        params: CryptoOnrampQuoteParams<DecentQuoteOptions>,
    ): Promise<CryptoOnrampQuote<DecentQuoteMetadata>> {
        const { sourceCurrency, targetCurrency, recipientAddress } = params;
        const sender = params.refundAddress ?? this.defaultSender;

        const srcChainId = this.supportedChains[sourceCurrency.chain];
        if (!srcChainId) {
            throw new CryptoOnrampError(
                `Decent: unsupported source chain "${sourceCurrency.chain}"`,
                CryptoOnrampError.UNSUPPORTED_SOURCE_CHAIN,
                { supportedChains: Object.keys(this.supportedChains) },
            );
        }

        const swapDirection: DecentSwapDirection =
            params.isSourceAmount === false ? 'exact-amount-out' : 'exact-amount-in';

        if (!isEvmAddress(sender)) {
            throw new CryptoOnrampError(
                'Decent: senderAddress must be a valid EVM address (got "' + sender + '")',
                CryptoOnrampError.INVALID_REFUND_ADDRESS,
            );
        }

        const url = new URL(`${this.apiUrl}/getAction`);
        url.searchParams.set('actionType', 'swap-action');
        url.searchParams.set('sender', sender);
        url.searchParams.set('srcChainId', String(srcChainId));
        url.searchParams.set('srcToken', sourceCurrency.address);
        url.searchParams.set('dstChainId', String(TON_CHAIN_ID));
        url.searchParams.set('dstToken', targetCurrency.address);
        url.searchParams.set('amount', params.amount);
        url.searchParams.set('swapDirection', swapDirection);
        url.searchParams.set('slippage', String(params.providerOptions?.slippageBps ?? DEFAULT_SLIPPAGE_BPS));
        url.searchParams.set('recipient', recipientAddress);
        url.searchParams.set('returnDepositAddress', 'true');

        let response: Response;
        try {
            response = await fetch(url.toString(), {
                method: 'GET',
                headers: { 'x-api-key': this.apiKey },
            });
        } catch (error) {
            throw new CryptoOnrampError(
                'Decent: network error while calling getAction',
                CryptoOnrampError.QUOTE_FAILED,
                error,
            );
        }

        const body = (await response.json().catch(() => undefined)) as DecentGetActionResponse;

        if (!response.ok || isErrorResponse(body)) {
            const err = isErrorResponse(body) ? body.error : undefined;
            throw new CryptoOnrampError(
                err?.message ?? `Decent getAction failed (HTTP ${response.status})`,
                err?.code ?? CryptoOnrampError.QUOTE_FAILED,
                err ?? { status: response.status },
            );
        }

        if (body.vmId !== 'evm') {
            throw new CryptoOnrampError(
                `Decent: only EVM source chains are supported (got vmId="${body.vmId}")`,
                CryptoOnrampError.INVALID_PARAMS,
                { vmId: body.vmId, srcChainId },
            );
        }

        const metadata: DecentQuoteMetadata = { sender, response: body };

        return {
            sourceCurrency,
            targetCurrency,
            sourceAmount: body.amountIn.amount,
            targetAmount: body.amountOut.amount,
            rate: String(body.exchangeRate),
            recipientAddress,
            providerId: this.providerId,
            metadata,
        };
    }

    async createDeposit(params: CryptoOnrampDepositParams<DecentQuoteMetadata>): Promise<CryptoOnrampDeposit> {
        const metadata = params.quote.metadata;
        if (!metadata?.response?.tx?.to) {
            throw new CryptoOnrampError(
                'Decent: quote metadata is missing — quote must be obtained from this provider',
                CryptoOnrampError.INVALID_PARAMS,
            );
        }

        const { response } = metadata;

        const needsRefetch =
            metadata.sender === this.defaultSender ||
            (params.refundAddress !== undefined && params.refundAddress !== metadata.sender);

        if (needsRefetch) {
            if (!params.refundAddress) {
                throw new CryptoOnrampError(
                    'Decent: a refund address is required to create a deposit',
                    CryptoOnrampError.REFUND_ADDRESS_REQUIRED,
                );
            }

            if (!isEvmAddress(params.refundAddress)) {
                throw new CryptoOnrampError(
                    'Decent: senderAddress must be a valid EVM address (got "' + params.refundAddress + '")',
                    CryptoOnrampError.INVALID_REFUND_ADDRESS,
                );
            }

            const newQuote = await this.getQuote({
                amount: params.quote.sourceAmount,
                sourceCurrency: params.quote.sourceCurrency,
                targetCurrency: params.quote.targetCurrency,
                recipientAddress: params.quote.recipientAddress,
                refundAddress: params.refundAddress,
                isSourceAmount: true,
            });
            const newMetadata = newQuote.metadata;

            if (!newMetadata) {
                throw new CryptoOnrampError(
                    'Decent: quote metadata is missing — quote must be obtained from this provider',
                    CryptoOnrampError.INVALID_PARAMS,
                );
            }

            return {
                depositId: newMetadata.response.txId,
                address: newMetadata.response.tx.to,
                amount: newMetadata.response.amountIn.amount,
                sourceCurrency: params.quote.sourceCurrency,
                providerId: this.providerId,
            };
        }

        return {
            depositId: response.txId,
            address: response.tx.to,
            amount: response.amountIn.amount,
            sourceCurrency: params.quote.sourceCurrency,
            providerId: this.providerId,
        };
    }

    async getStatus(params: CryptoOnrampStatusParams): Promise<CryptoOnrampStatus> {
        const url = new URL(`${this.apiUrl}/getStatus`);
        url.searchParams.set('txId', params.depositId);

        let response: Response;
        try {
            response = await fetch(url.toString(), {
                method: 'GET',
                headers: { 'x-api-key': this.apiKey },
            });
        } catch (error) {
            throw new CryptoOnrampError(
                'Decent: network error while fetching status',
                CryptoOnrampError.PROVIDER_ERROR,
                error,
            );
        }

        const body = (await response.json().catch(() => undefined)) as { status: string };

        if (!response.ok || isErrorResponse(body)) {
            const err = isErrorResponse(body) ? body.error : undefined;

            if (isErrorResponse(body) && err?.code === 'NOT_FOUND') {
                return 'pending';
            }

            throw new CryptoOnrampError(
                err?.message ?? `Decent getStatus failed (HTTP ${response.status})`,
                err?.code ?? CryptoOnrampError.PROVIDER_ERROR,
                err ?? { status: response.status },
            );
        }

        return mapStatus(body.status);
    }

    /**
     * Decent's API has no token-enumeration endpoint, so we just return the curated
     * static list. Consumers can override via {@link DecentProviderConfig.supportedCurrencies}.
     */
    async getSupportedCurrencies(): Promise<CryptoOnrampSupportedCurrencies> {
        return this.supportedCurrencies;
    }
}

/**
 * Returns a `ProviderFactory` for `DecentCryptoOnrampProvider`.
 * Pass to `providers: [createDecentProvider(config)]`.
 */
export const createDecentProvider = (config: DecentProviderConfig) =>
    createProvider(() => new DecentCryptoOnrampProvider(config));
