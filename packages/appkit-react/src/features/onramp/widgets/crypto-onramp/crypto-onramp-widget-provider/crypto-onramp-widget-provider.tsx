/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect, useMemo } from 'react';
import type { FC, PropsWithChildren } from 'react';
import type { CryptoOnrampDestinationCurrency, CryptoOnrampSourceCurrency } from '@ton/appkit';

import { useAddress } from '../../../../wallets';
import { useCryptoOnrampProvider } from '../../../hooks/use-crypto-onramp-provider';
import { useCryptoOnrampProviders } from '../../../hooks/use-crypto-onramp-providers';
import { useCryptoOnrampSupportedCurrencies } from '../../../hooks/use-crypto-onramp-supported-currencies';
import { DEFAULT_ONRAMP_PRESETS } from '../../../constants';
import type { ChainInfo } from '../utils/chains';
import { DEFAULT_CHAINS } from '../utils/chains';
import { CryptoOnrampContext } from './crypto-onramp-context';
import { DEFAULT_DESTINATION_CURRENCY, DEFAULT_SOURCE_CURRENCY } from './defaults';
import { useCryptoOnrampBalance } from './use-crypto-onramp-balance';
import { useCryptoOnrampProvidersWithMetadata } from './use-crypto-onramp-providers-with-metadata';
import { useCryptoOnrampQuoteAndDeposit } from './use-crypto-onramp-quote-and-deposit';
import { useCryptoOnrampTokenState } from './use-crypto-onramp-token-state';
import { useCryptoOnrampValidation } from './use-crypto-onramp-validation';

export interface CryptoOnrampProviderProps extends PropsWithChildren {
    /**
     * Custom CAIP-2 → chain display info overrides. Merged on top of the
     * built-in defaults, so consumers only need to provide what they want to
     * override or add (e.g. `{ 'eip155:42161': { name: 'Arbitrum', logo: '...' } }`).
     */
    chains?: Record<string, ChainInfo>;
    /**
     * Initial destination (TON-side) currency. Rendered immediately on first paint, so the
     * full object — including `symbol`, `decimals`, and `logo` — must be provided. Defaults
     * to USDT on TON when omitted.
     */
    defaultDestination?: CryptoOnrampDestinationCurrency;
    /**
     * Initial source currency. Rendered immediately on first paint, so the full object —
     * including `chain`, `symbol`, `decimals`, and `logo` — must be provided. Defaults to
     * USDT0 on Arbitrum when omitted.
     */
    defaultSource?: CryptoOnrampSourceCurrency;
}

export const CryptoOnrampWidgetProvider: FC<CryptoOnrampProviderProps> = ({
    children,
    chains: chainsOverride,
    defaultDestination = DEFAULT_DESTINATION_CURRENCY,
    defaultSource = DEFAULT_SOURCE_CURRENCY,
}) => {
    // 2. Queries and external readers
    const userAddress = useAddress();
    const [provider, setProviderId] = useCryptoOnrampProvider();
    const providers = useCryptoOnrampProviders();
    const { metadataByProviderId: providersMetadata, isLoading: isProvidersMetadataLoading } =
        useCryptoOnrampProvidersWithMetadata();

    const { data: supportedCurrencies } = useCryptoOnrampSupportedCurrencies({
        providerId: provider?.providerId,
        query: { enabled: !!provider },
    });

    const tokens = useMemo(() => supportedCurrencies?.destination ?? [], [supportedCurrencies]);
    const paymentMethods = useMemo(() => supportedCurrencies?.source ?? [], [supportedCurrencies]);

    // 1. Local state
    const {
        selectedToken,
        setSelectedToken,
        selectedMethod,
        setSelectedMethod,
        amount,
        setAmount,
        amountInputMode,
        setAmountInputMode,
    } = useCryptoOnrampTokenState({ defaultDestination, defaultSource });

    const { targetBalance, isLoadingTargetBalance } = useCryptoOnrampBalance({ selectedToken, userAddress });

    // 4. Mutations (quote query + deposit mutation + status query coordinated together)
    const {
        amountDebounced,
        quote,
        quoteError,
        isQuoteFetching,
        refundAddressMode,
        isReversedAmountSupported,
        deposit,
        depositError,
        isCreatingDeposit,
        depositStatus,
        convertedAmount,
        depositAmount,
        createDeposit,
        onReset,
    } = useCryptoOnrampQuoteAndDeposit({
        selectedToken,
        selectedMethod,
        amount,
        amountInputMode,
        userAddress,
        providerId: provider?.providerId,
    });

    // 3. Derivations
    const {
        quoteError: validationQuoteError,
        depositError: validationDepositError,
        canSubmit,
    } = useCryptoOnrampValidation({
        amount,
        amountDebounced,
        amountInputMode,
        selectedMethod,
        selectedToken,
        quoteError,
        depositError,
        hasQuote: !!quote,
    });

    const isLoadingQuote = isQuoteFetching || amount !== amountDebounced;
    const canContinue = canSubmit && !isQuoteFetching && amount === amountDebounced && !!userAddress;

    const chains = useMemo(() => ({ ...DEFAULT_CHAINS, ...(chainsOverride ?? {}) }), [chainsOverride]);

    useEffect(() => {
        if (!isReversedAmountSupported && amountInputMode === 'token') {
            setAmountInputMode('method');
        }
    }, [isReversedAmountSupported, amountInputMode, setAmountInputMode]);

    const value = useMemo(
        () => ({
            tokens,
            selectedToken,
            setSelectedToken,
            paymentMethods,
            selectedMethod,
            setSelectedMethod,
            chains,
            amount,
            setAmount,
            amountInputMode,
            setAmountInputMode,
            convertedAmount,
            presetAmounts: DEFAULT_ONRAMP_PRESETS,
            provider,
            providers,
            providersMetadata,
            isProvidersMetadataLoading,
            setProviderId,
            quote,
            isLoadingQuote,
            quoteError: validationQuoteError,
            refundAddressMode,
            isReversedAmountSupported,
            deposit,
            isCreatingDeposit,
            depositError: validationDepositError,
            depositAmount,
            createDeposit,
            isWalletConnected: !!userAddress,
            canContinue,
            onReset,
            depositStatus,
            targetBalance,
            isLoadingTargetBalance,
        }),
        [
            tokens,
            selectedToken,
            setSelectedToken,
            paymentMethods,
            selectedMethod,
            setSelectedMethod,
            chains,
            amount,
            setAmount,
            amountInputMode,
            setAmountInputMode,
            convertedAmount,
            provider,
            providers,
            providersMetadata,
            isProvidersMetadataLoading,
            setProviderId,
            quote,
            isLoadingQuote,
            validationQuoteError,
            refundAddressMode,
            isReversedAmountSupported,
            deposit,
            isCreatingDeposit,
            validationDepositError,
            depositAmount,
            createDeposit,
            userAddress,
            canContinue,
            onReset,
            depositStatus,
            targetBalance,
            isLoadingTargetBalance,
        ],
    );

    return <CryptoOnrampContext.Provider value={value}>{children}</CryptoOnrampContext.Provider>;
};
