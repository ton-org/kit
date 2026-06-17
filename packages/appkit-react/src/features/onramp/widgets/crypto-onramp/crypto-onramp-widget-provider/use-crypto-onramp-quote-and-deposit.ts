/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useCallback, useMemo } from 'react';
import { formatUnits, parseUnits } from '@ton/appkit';
import type { CryptoOnrampDestinationCurrency, CryptoOnrampSourceCurrency } from '@ton/appkit';

import { useCreateCryptoOnrampDeposit } from '../../../hooks/use-create-crypto-onramp-deposit';
import { useCryptoOnrampProviderMetadata } from '../../../hooks/use-crypto-onramp-provider-metadata';
import { useCryptoOnrampQuote } from '../../../hooks/use-crypto-onramp-quote';
import { useCryptoOnrampStatus } from '../../../hooks/use-crypto-onramp-status';
import { useDebounceValue } from '../../../../../hooks/use-debounce-value';
import type { CryptoAmountInputMode } from './crypto-onramp-context';

const QUOTE_DEBOUNCE_MS = 500;
const STATUS_REFETCH_MS = 10000;

interface UseCryptoOnrampQuoteAndDepositOptions {
    selectedToken: CryptoOnrampDestinationCurrency | null;
    selectedMethod: CryptoOnrampSourceCurrency | null;
    amount: string;
    amountInputMode: CryptoAmountInputMode;
    userAddress: string | undefined;
    providerId: string | undefined;
}

export const useCryptoOnrampQuoteAndDeposit = ({
    selectedToken,
    selectedMethod,
    amount,
    amountInputMode,
    userAddress,
    providerId,
}: UseCryptoOnrampQuoteAndDepositOptions) => {
    const [amountDebounced] = useDebounceValue(amount, QUOTE_DEBOUNCE_MS);

    const requestAmountDecimals =
        amountInputMode === 'method' ? (selectedMethod?.decimals ?? 0) : (selectedToken?.decimals ?? 0);

    const requestAmountBase = useMemo(() => {
        if (!amountDebounced || isNaN(parseFloat(amountDebounced))) return '';
        try {
            return parseUnits(amountDebounced, requestAmountDecimals).toString();
        } catch {
            return '';
        }
    }, [amountDebounced, requestAmountDecimals]);

    const quoteQuery = useCryptoOnrampQuote({
        amount: requestAmountBase,
        sourceCurrency: selectedMethod ?? undefined,
        targetCurrency: selectedToken ?? undefined,
        recipientAddress: userAddress ?? '',
        isSourceAmount: amountInputMode === 'method',
        providerId,
        query: {
            enabled:
                !!requestAmountBase &&
                !!selectedToken &&
                !!selectedMethod &&
                !!userAddress &&
                parseFloat(amountDebounced) > 0,
            retry: false,
            // Keep the previous quote across debounced amount changes (no flicker while typing),
            // but drop it as soon as a currency changes so a stale quote/conversion never lingers.
            placeholderData: (previousData) =>
                previousData &&
                previousData.sourceCurrency.address === selectedMethod?.address &&
                previousData.sourceCurrency.chain === selectedMethod?.chain &&
                previousData.targetCurrency.address === selectedToken?.address
                    ? previousData
                    : undefined,
            refetchOnWindowFocus: false,
        },
    });

    const selectedProviderMetadata = useCryptoOnrampProviderMetadata({ providerId });
    const refundAddressMode = selectedProviderMetadata?.refundAddressMode ?? 'off';
    const isReversedAmountSupported = selectedProviderMetadata?.isReversedAmountSupported ?? true;

    const createDepositMutation = useCreateCryptoOnrampDeposit();

    const { data: depositStatus } = useCryptoOnrampStatus({
        depositId: createDepositMutation.data?.depositId,
        query: {
            refetchInterval: STATUS_REFETCH_MS,
            retry: false,
        },
    });

    const convertedAmount = useMemo(() => {
        // The quote query keeps its previous result after the user clears the input, so we must
        // gate on the current amount to avoid showing a stale conversion.
        if (!quoteQuery.data || !(parseFloat(amount) > 0)) return '';
        const rawAmount = amountInputMode === 'token' ? quoteQuery.data.sourceAmount : quoteQuery.data.targetAmount;
        const decimals = amountInputMode === 'token' ? (selectedMethod?.decimals ?? 0) : (selectedToken?.decimals ?? 0);
        return formatUnits(rawAmount, decimals);
    }, [quoteQuery.data, amount, amountInputMode, selectedMethod, selectedToken]);

    const depositAmount = useMemo(() => {
        if (createDepositMutation.data && selectedMethod) {
            return formatUnits(createDepositMutation.data.amount, selectedMethod.decimals);
        }
        return amount;
    }, [createDepositMutation.data, amount, selectedMethod]);

    const createDeposit = useCallback(
        (refundAddress?: string) => {
            if (!quoteQuery.data || !userAddress) return;
            if (refundAddressMode === 'required' && !refundAddress) return;

            createDepositMutation.mutate({
                quote: quoteQuery.data,
                providerId: quoteQuery.data.providerId,
                refundAddress: refundAddress ?? '',
            });
        },
        [quoteQuery.data, userAddress, createDepositMutation, refundAddressMode],
    );

    const onReset = useCallback(() => {
        createDepositMutation.reset();
        quoteQuery.refetch();
    }, [createDepositMutation, quoteQuery]);

    return {
        amountDebounced,
        quote: quoteQuery.data ?? null,
        quoteError: quoteQuery.error,
        isQuoteFetching: quoteQuery.isFetching,
        refundAddressMode,
        isReversedAmountSupported,
        deposit: createDepositMutation.data ?? null,
        depositError: createDepositMutation.error,
        isCreatingDeposit: createDepositMutation.isPending,
        depositStatus: depositStatus ?? null,
        convertedAmount,
        depositAmount,
        createDeposit,
        onReset,
    };
};
