/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect, useMemo } from 'react';
import type { FC, PropsWithChildren } from 'react';
import { compareAddress } from '@ton/appkit';

import { useAddress } from '../../../../wallets';
import { useCryptoOnrampProvider } from '../../../hooks/use-crypto-onramp-provider';
import { useCryptoOnrampProviders } from '../../../hooks/use-crypto-onramp-providers';
import { useCryptoOnrampSupportedCurrencies } from '../../../hooks/use-crypto-onramp-supported-currencies';
import { DEFAULT_ONRAMP_PRESETS } from '../../../constants';
import type { ChainInfo } from '../utils/chains';
import { DEFAULT_CHAINS } from '../utils/chains';
import { CryptoOnrampContext } from './crypto-onramp-context';
import { useCryptoOnrampBalance } from './use-crypto-onramp-balance';
import { useCryptoOnrampProvidersWithMetadata } from './use-crypto-onramp-providers-with-metadata';
import { useCryptoOnrampQuoteAndDeposit } from './use-crypto-onramp-quote-and-deposit';
import { useCryptoOnrampTokenState } from './use-crypto-onramp-token-state';
import { useCryptoOnrampValidation } from './use-crypto-onramp-validation';

/**
 * Reference to a destination (TON-side) currency by its jetton-master address.
 * Compared via `compareAddress`, so EQ/UQ address forms are equivalent.
 */
export interface CryptoOnrampDestinationRef {
    address: string;
}

/**
 * Reference to a source currency. Each provided field acts as a filter and the first
 * matching list entry wins. `address` is compared lowercase (source chains are non-TON);
 * an empty string matches the chain's native coin.
 */
export interface CryptoOnrampSourceRef {
    address: string;
    /** Optional CAIP-2 chain id (e.g. `'eip155:42161'`) — narrows the match when the same address exists on several chains. */
    chain?: string;
}

export interface CryptoOnrampProviderProps extends PropsWithChildren {
    /**
     * Custom CAIP-2 → chain display info overrides. Merged on top of the
     * built-in defaults, so consumers only need to provide what they want to
     * override or add (e.g. `{ 'eip155:42161': { name: 'Arbitrum', logo: '...' } }`).
     */
    chains?: Record<string, ChainInfo>;
    /**
     * Optional default destination (TON-side) currency reference. Resolved against the
     * loaded supported-currency list — the selected object always comes from the list
     * (canonical decimals/logo/symbol), never from the consumer. When the reference
     * doesn't match anything (or is omitted), the first list entry is selected.
     */
    defaultDestination?: CryptoOnrampDestinationRef;
    /**
     * Optional default source currency reference. Same resolution behaviour as
     * {@link defaultDestination}.
     */
    defaultSource?: CryptoOnrampSourceRef;
}

export const CryptoOnrampWidgetProvider: FC<CryptoOnrampProviderProps> = ({
    children,
    chains: chainsOverride,
    defaultDestination,
    defaultSource,
}) => {
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
    } = useCryptoOnrampTokenState();

    // 2. Queries and external readers
    const userAddress = useAddress();
    const [provider, setProviderId] = useCryptoOnrampProvider();
    const providers = useCryptoOnrampProviders();
    const { metadataByProviderId: providersMetadata, isLoading: isProvidersMetadataLoading } =
        useCryptoOnrampProvidersWithMetadata();

    const { data: supportedCurrencies, isLoading: isLoadingSupportedCurrencies } = useCryptoOnrampSupportedCurrencies({
        providerId: provider?.providerId,
        query: { enabled: !!provider },
    });

    const { targetBalance, isLoadingTargetBalance } = useCryptoOnrampBalance({ selectedToken, userAddress });

    // 3. Derivations (pre-mutation)
    const tokens = useMemo(() => supportedCurrencies?.destination ?? [], [supportedCurrencies]);
    const paymentMethods = useMemo(() => supportedCurrencies?.source ?? [], [supportedCurrencies]);
    const chains = useMemo(() => ({ ...DEFAULT_CHAINS, ...(chainsOverride ?? {}) }), [chainsOverride]);

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

    // 3. Derivations (post-mutation)
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

    // 6. Effects
    useEffect(() => {
        if (!isReversedAmountSupported && amountInputMode === 'token') {
            setAmountInputMode('method');
        }
    }, [isReversedAmountSupported, amountInputMode, setAmountInputMode]);

    // Resolve the selection once `supportedCurrencies` loads: consumer defaults are
    // references looked up in the live list, falling back to the first entry, so the
    // selected object always carries canonical decimals/logo/symbol. Fires once per
    // side — after the user picks, `selectedX` is non-null and the effect short-circuits.
    useEffect(() => {
        const first = tokens[0];
        if (selectedToken || !first) return;
        const match = defaultDestination
            ? tokens.find((token) => compareAddress(token.address, defaultDestination.address))
            : undefined;
        setSelectedToken(match ?? first);
    }, [tokens, selectedToken, defaultDestination, setSelectedToken]);

    useEffect(() => {
        const first = paymentMethods[0];
        if (selectedMethod || !first) return;
        const match = defaultSource
            ? paymentMethods.find(
                  (method) =>
                      method.address.toLowerCase() === defaultSource.address.toLowerCase() &&
                      (defaultSource.chain === undefined || method.chain === defaultSource.chain),
              )
            : undefined;
        setSelectedMethod(match ?? first);
    }, [paymentMethods, selectedMethod, defaultSource, setSelectedMethod]);

    const value = useMemo(
        () => ({
            tokens,
            selectedToken,
            setSelectedToken,
            paymentMethods,
            selectedMethod,
            setSelectedMethod,
            isLoadingSupportedCurrencies,
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
            isLoadingSupportedCurrencies,
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
