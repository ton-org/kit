/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
    Network,
    StakeParams,
    StakingBalance,
    StakingProviderInfo,
    StakingProviderInterface,
    StakingProviderMetadata,
    StakingQuote,
    StakingQuoteParams,
    TransactionRequest,
    UserFriendlyAddress,
} from '@ton/walletkit';
import { TonStakersStakingProvider } from '@ton/walletkit/staking/tonstakers';
import type { TonStakersProviderConfig } from '@ton/walletkit/staking/tonstakers';

import { bridgeRequest } from '../transport/nativeBridge';
import { getKit } from '../utils/bridge';
import { get, release, retainWithId } from '../utils/registry';

/**
 * JS-side proxy that implements [StakingProviderInterface] by forwarding every call to a
 * Kotlin-implemented `ITONStakingProvider` via reverse-RPC.
 *
 * `getStakingProviderMetadata` and `getSupportedNetworks` are synchronous per the interface
 * contract, so both values are passed in at registration and cached on this instance.
 */
class ProxyStakingProvider implements StakingProviderInterface {
    readonly type = 'staking' as const;

    constructor(
        readonly providerId: string,
        private readonly metadata: StakingProviderMetadata,
        private readonly supportedNetworks: Network[],
    ) {}

    async getQuote(params: StakingQuoteParams): Promise<StakingQuote> {
        const resultJson = (await bridgeRequest('kotlinStakingProviderGetQuote', {
            providerId: this.providerId,
            params: JSON.stringify(params),
        })) as string;
        return JSON.parse(resultJson) as StakingQuote;
    }

    async buildStakeTransaction(params: StakeParams): Promise<TransactionRequest> {
        const resultJson = (await bridgeRequest('kotlinStakingProviderBuildStakeTransaction', {
            providerId: this.providerId,
            params: JSON.stringify(params),
        })) as string;
        return JSON.parse(resultJson) as TransactionRequest;
    }

    async getStakedBalance(userAddress: UserFriendlyAddress, network?: Network): Promise<StakingBalance> {
        const resultJson = (await bridgeRequest('kotlinStakingProviderGetStakedBalance', {
            providerId: this.providerId,
            userAddress,
            networkChainId: network?.chainId ?? null,
        })) as string;
        return JSON.parse(resultJson) as StakingBalance;
    }

    async getStakingProviderInfo(network?: Network): Promise<StakingProviderInfo> {
        const resultJson = (await bridgeRequest('kotlinStakingProviderGetStakingProviderInfo', {
            providerId: this.providerId,
            networkChainId: network?.chainId ?? null,
        })) as string;
        return JSON.parse(resultJson) as StakingProviderInfo;
    }

    getStakingProviderMetadata(_network?: Network): StakingProviderMetadata {
        return this.metadata;
    }

    getSupportedNetworks(): Network[] {
        return this.supportedNetworks;
    }
}

export async function createTonStakersStakingProvider(args?: { config?: TonStakersProviderConfig }) {
    const instance = await getKit();
    const provider = TonStakersStakingProvider.createFromContext(instance.createFactoryContext(), args?.config ?? {});
    // Retain under the provider's own id (e.g. 'tonstakers') rather than a generated handle, so that
    // the id we hand back to Kotlin matches what StakingManager stores when registerProvider(provider)
    // indexes providers by `provider.providerId`. Mirrors the swap bridge's createOmnistonSwapProvider.
    retainWithId(provider.providerId, provider);
    return { providerId: provider.providerId };
}

export async function registerStakingProvider(args: { providerId: string }) {
    const provider = get<StakingProviderInterface>(args.providerId);
    if (!provider) throw new Error(`Staking provider not found: ${args.providerId}`);
    const instance = await getKit();
    instance.staking.registerProvider(provider);
}

export async function removeStakingProvider(args: { providerId: string }): Promise<void> {
    const instance = await getKit();
    if (!instance.staking.hasProvider(args.providerId)) return;
    instance.staking.removeProvider(instance.staking.getProvider(args.providerId));
}

export async function setDefaultStakingProvider(args: { providerId: string }) {
    const instance = await getKit();
    instance.staking.setDefaultProvider(args.providerId);
}

export async function getRegisteredStakingProviders(): Promise<{ providerIds: string[] }> {
    const instance = await getKit();
    const providerIds = instance.staking.getProviders().map((provider) => provider.providerId);
    return { providerIds };
}

export async function hasStakingProvider(args: { providerId: string }): Promise<{ result: boolean }> {
    const instance = await getKit();
    return { result: instance.staking.hasProvider(args.providerId) };
}

export async function getStakingQuote(args: StakingQuoteParams & { providerId?: string }) {
    const { providerId, ...params } = args;
    const instance = await getKit();
    return instance.staking.getQuote(params, providerId);
}

export async function buildStakeTransaction(args: StakeParams & { providerId?: string }) {
    const { providerId, ...params } = args;
    const instance = await getKit();
    return instance.staking.buildStakeTransaction(params, providerId);
}

export async function getStakedBalance(args: {
    userAddress: string;
    network?: { chainId: string };
    providerId?: string;
}) {
    const instance = await getKit();
    return instance.staking.getStakedBalance(args.userAddress, args.network, args.providerId);
}

export async function getStakingProviderInfo(args: { network?: { chainId: string }; providerId?: string }) {
    const instance = await getKit();
    return instance.staking.getStakingProviderInfo(args.network, args.providerId);
}

export async function getStakingProviderMetadata(args: { network?: { chainId: string }; providerId?: string }) {
    const instance = await getKit();
    return instance.staking.getStakingProviderMetadata(args.network, args.providerId);
}

export async function getStakingProviderSupportedNetworks(args: {
    providerId: string;
}): Promise<{ networks: Network[] }> {
    const instance = await getKit();
    const networks = instance.staking.getProvider(args.providerId).getSupportedNetworks();
    return { networks };
}

/**
 * Tell the JS staking manager that a Kotlin-implemented provider is available.
 * A [ProxyStakingProvider] is created and registered; all subsequent staking operations on it
 * forward to the Kotlin instance via reverse-RPC.
 *
 * @param args.providerId Unique id — matches `identifier.name` on the Kotlin side.
 * @param args.metadata Static provider metadata returned synchronously from `getStakingProviderMetadata`.
 * @param args.supportedNetworks Networks the Kotlin provider can serve, returned by `getSupportedNetworks`.
 */
export async function registerKotlinStakingProvider(args: {
    providerId: string;
    metadata: StakingProviderMetadata;
    supportedNetworks: Network[];
}) {
    const instance = await getKit();
    const previous = get<ProxyStakingProvider>(args.providerId);
    if (previous instanceof ProxyStakingProvider) {
        release(args.providerId);
    }
    const provider = new ProxyStakingProvider(args.providerId, args.metadata, args.supportedNetworks);
    retainWithId(args.providerId, provider);
    instance.staking.registerProvider(provider);
}
