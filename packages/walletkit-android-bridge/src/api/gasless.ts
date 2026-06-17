/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
    GaslessAPI,
    GaslessConfig,
    GaslessProviderInterface,
    GaslessProviderMetadata,
    GaslessQuote,
    GaslessQuoteParams,
    GaslessSendParams,
    GaslessSendResponse,
    Network,
} from '@ton/walletkit';
import { TonApiGaslessProvider } from '@ton/walletkit/gasless/tonapi';
import type { TonApiGaslessProviderConfig } from '@ton/walletkit/gasless/tonapi';

import { getKit } from '../utils/bridge';
import { get, retainWithId } from '../utils/registry';

async function getGasless(): Promise<GaslessAPI> {
    const instance = await getKit();
    if (!instance.gasless) throw new Error('Gasless is not configured');
    return instance.gasless;
}

export async function createTonApiGaslessProvider(args?: {
    config?: TonApiGaslessProviderConfig;
}): Promise<{ providerId: string }> {
    const instance = await getKit();
    const provider = TonApiGaslessProvider.createFromContext(instance.createFactoryContext(), args?.config ?? {});
    // Retain under the provider's own id so it matches what GaslessManager indexes on registerProvider.
    retainWithId(provider.providerId, provider);
    return { providerId: provider.providerId };
}

export async function registerGaslessProvider(args: { providerId: string }): Promise<void> {
    (await getGasless()).registerProvider(get(args.providerId) as GaslessProviderInterface);
}

export async function removeGaslessProvider(args: { providerId: string }): Promise<void> {
    const gasless = await getGasless();
    gasless.removeProvider(gasless.getProvider(args.providerId));
}

export async function setDefaultGaslessProvider(args: { providerId: string }): Promise<void> {
    (await getGasless()).setDefaultProvider(args.providerId);
}

export async function getGaslessProviderSupportedNetworks(args: {
    providerId: string;
}): Promise<{ networks: Network[] }> {
    const networks = (await getGasless()).getProvider(args.providerId).getSupportedNetworks();
    return { networks };
}

export async function getRegisteredGaslessProviders(): Promise<{ providerIds: string[] }> {
    const providerIds = (await getGasless()).getProviders().map((provider) => provider.providerId);
    return { providerIds };
}

export async function hasGaslessProvider(args: { providerId: string }): Promise<{ result: boolean }> {
    const result = (await getGasless()).hasProvider(args.providerId);
    return { result };
}

export async function getGaslessMetadata(args: { providerId?: string }): Promise<GaslessProviderMetadata> {
    return (await getGasless()).getMetadata(args.providerId);
}

export async function getGaslessConfig(args: { network?: Network; providerId?: string }): Promise<GaslessConfig> {
    return (await getGasless()).getConfig(args.network, args.providerId);
}

export async function getGaslessQuote(args: {
    params: GaslessQuoteParams;
    providerId?: string;
}): Promise<GaslessQuote> {
    return (await getGasless()).getQuote(args.params, args.providerId);
}

export async function gaslessSendTransaction(args: {
    params: GaslessSendParams;
    providerId?: string;
}): Promise<GaslessSendResponse> {
    return (await getGasless()).sendTransaction(args.params, args.providerId);
}
