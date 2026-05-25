/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { AppKit } from '@ton/appkit';
import {
    getGaslessManager,
    getGaslessProvider,
    getGaslessProviderMetadata,
    getGaslessProviders,
    getGaslessQuote,
    getGaslessSupportedAssets,
    sendGaslessTransaction,
    setDefaultGaslessProvider,
    watchGaslessProviders,
} from '@ton/appkit';

export const gaslessExample = async (appKit: AppKit) => {
    // SAMPLE_START: GET_GASLESS_MANAGER
    const gaslessManager = getGaslessManager(appKit);
    // SAMPLE_END: GET_GASLESS_MANAGER

    // SAMPLE_START: GET_GASLESS_PROVIDER
    const provider = getGaslessProvider(appKit, { id: 'tonapi' });
    // SAMPLE_END: GET_GASLESS_PROVIDER

    // SAMPLE_START: GET_GASLESS_PROVIDERS
    const providers = getGaslessProviders(appKit);
    console.log(
        'Registered gasless providers:',
        providers.map((p) => p.providerId),
    );
    // SAMPLE_END: GET_GASLESS_PROVIDERS

    // SAMPLE_START: SET_DEFAULT_GASLESS_PROVIDER
    setDefaultGaslessProvider(appKit, { providerId: 'tonapi' });
    // SAMPLE_END: SET_DEFAULT_GASLESS_PROVIDER

    // SAMPLE_START: WATCH_GASLESS_PROVIDERS
    const unsubscribe = watchGaslessProviders(appKit, {
        onChange: () => console.log('Gasless providers updated'),
    });
    unsubscribe();
    // SAMPLE_END: WATCH_GASLESS_PROVIDERS

    // SAMPLE_START: GET_GASLESS_PROVIDER_METADATA
    const metadata = await getGaslessProviderMetadata(appKit);
    console.log('Gasless provider:', metadata.name, metadata.url);
    // SAMPLE_END: GET_GASLESS_PROVIDER_METADATA

    // SAMPLE_START: GET_GASLESS_SUPPORTED_ASSETS
    const supportedAssets = await getGaslessSupportedAssets(appKit);
    const feeAsset = supportedAssets[0].address;
    console.log('Supported fee assets:', supportedAssets.length);
    // SAMPLE_END: GET_GASLESS_SUPPORTED_ASSETS

    // SAMPLE_START: GET_GASLESS_QUOTE
    const quote = await getGaslessQuote(appKit, {
        feeAsset,
        messages: [
            {
                address: 'EQ...jetton_wallet_address',
                amount: '60000000', // 0.06 TON gas budget
                payload: 'te6cckEBAQEAAgAAAA==' as never,
            },
        ],
    });
    console.log('Relayer fee:', quote.fee, 'valid until:', quote.validUntil);
    // SAMPLE_END: GET_GASLESS_QUOTE

    // SAMPLE_START: SEND_GASLESS_TRANSACTION
    const result = await sendGaslessTransaction(appKit, { quote });
    console.log('Submitted gasless transaction. Hash:', result.normalizedHash, 'BoC:', result.internalBoc);
    // SAMPLE_END: SEND_GASLESS_TRANSACTION

    return { gaslessManager, provider, supportedAssets, quote };
};
