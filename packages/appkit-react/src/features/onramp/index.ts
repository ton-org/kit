/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

export * from './widgets/crypto-onramp/crypto-onramp-widget';
export * from './widgets/crypto-onramp/crypto-onramp-widget-ui';
export * from './widgets/crypto-onramp/crypto-onramp-widget-provider';

export { useCryptoOnrampProvider, type UseCryptoOnrampProviderReturnType } from './hooks/use-crypto-onramp-provider';
export {
    useCryptoOnrampProviderById,
    type UseCryptoOnrampProviderByIdReturnType,
} from './hooks/use-crypto-onramp-provider-by-id';
export { useCryptoOnrampProviders, type UseCryptoOnrampProvidersReturnType } from './hooks/use-crypto-onramp-providers';
export {
    useCryptoOnrampQuote,
    type UseCryptoOnrampQuoteParameters,
    type UseCryptoOnrampQuoteReturnType,
} from './hooks/use-crypto-onramp-quote';
export {
    useCreateCryptoOnrampDeposit,
    type UseCreateCryptoOnrampDepositParameters,
    type UseCreateCryptoOnrampDepositReturnType,
} from './hooks/use-create-crypto-onramp-deposit';
export {
    useCryptoOnrampStatus,
    type UseCryptoOnrampStatusParameters,
    type UseCryptoOnrampStatusReturnType,
} from './hooks/use-crypto-onramp-status';
export {
    useCryptoOnrampSupportedCurrencies,
    type UseCryptoOnrampSupportedCurrenciesParameters,
    type UseCryptoOnrampSupportedCurrenciesReturnType,
} from './hooks/use-crypto-onramp-supported-currencies';
export {
    useCryptoOnrampProviderMetadata,
    type UseCryptoOnrampProviderMetadataParameters,
    type UseCryptoOnrampProviderMetadataReturnType,
} from './hooks/use-crypto-onramp-provider-metadata';

export * from './types';
