/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
    GaslessConfig,
    GaslessProviderMetadata,
    GaslessQuote,
    GaslessQuoteParams,
    GaslessSendParams,
    GaslessSendResponse,
    Network,
} from '../models';
import type { DefiManagerAPI } from './DefiManagerAPI';
import type { DefiProvider } from './DefiProvider';

/**
 * Gasless API interface exposed by GaslessManager.
 *
 * Gasless lets a dApp submit on-chain transactions without the user paying GRAM
 * for gas: a relayer co-signs and covers the gas, taking a jetton fee in return.
 */
export interface GaslessAPI extends DefiManagerAPI<GaslessProviderInterface> {
    /**
     * Get static metadata for a gasless provider (display name, logo, url).
     * @param providerId Provider identifier (optional, uses default if not specified)
     */
    getMetadata(providerId?: string): Promise<GaslessProviderMetadata>;

    /**
     * Fetch the relayer's configuration on a given network — the relay address
     * (e.g. for jetton-transfer `responseDestination`) and the assets it
     * accepts as fee payment.
     * @param network Network to query (optional, falls back to the provider's first supported network)
     * @param providerId Provider identifier (optional, uses default if not specified)
     */
    getConfig(network?: Network, providerId?: string): Promise<GaslessConfig>;

    /**
     * Quote fees and obtain relayer-wrapped messages for signing.
     *
     * Pass the returned `messages` to `wallet.signMessage` to obtain a signed
     * internal-message BoC, then submit it via `sendTransaction`.
     *
     * @param params Quote parameters (network, wallet identity, fee jetton, messages)
     * @param providerId Provider identifier (optional, uses default if not specified)
     */
    getQuote(params: GaslessQuoteParams, providerId?: string): Promise<GaslessQuote>;

    /**
     * Submit a signed transaction BoC to the relayer for on-chain execution.
     *
     * Returns `GaslessSendResponse` — a strict superset of `SendTransactionResponse`
     * adding the signed `internalBoc` — so gasless and regular sends share the same
     * `{ boc, normalizedBoc, normalizedHash }` triple for explorer / status lookup.
     *
     * @param params Signed message bundle (network, wallet public key, internal BoC)
     * @param providerId Provider identifier (optional, uses default if not specified)
     */
    sendTransaction(params: GaslessSendParams, providerId?: string): Promise<GaslessSendResponse>;
}

/**
 * Interface that all gasless providers must implement.
 */
export interface GaslessProviderInterface extends DefiProvider {
    readonly type: 'gasless';

    /**
     * Unique identifier for the provider
     */
    readonly providerId: string;

    /**
     * Get static metadata for the provider (display name, logo, url).
     */
    getMetadata(): Promise<GaslessProviderMetadata>;

    /**
     * Fetch the relayer's configuration (relay address + accepted fee assets)
     * for the requested network.
     */
    getConfig(network: Network): Promise<GaslessConfig>;

    /**
     * Quote fees and return relayer-wrapped messages for signing.
     */
    getQuote(params: GaslessQuoteParams): Promise<GaslessQuote>;

    /**
     * Submit a signed transaction BoC to the relayer.
     */
    sendTransaction(params: GaslessSendParams): Promise<GaslessSendResponse>;
}
