/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { tryToBounceableAddress, validateNumericString } from '@ton/appkit';
import type { CryptoOnrampDestinationCurrency, CryptoOnrampSourceCurrency } from '@ton/appkit';

import type { CryptoAmountInputMode } from './crypto-onramp-context';

interface UseCryptoOnrampTokenStateOptions {
    tokens: CryptoOnrampDestinationCurrency[];
    paymentMethods: CryptoOnrampSourceCurrency[];
    defaultDestination?: { address: string };
    defaultSource?: { chain: string; address: string };
}

// Source currencies live on EVM-style chains — addresses are case-insensitive hex.
const sourceKey = (s: { chain: string; address: string }): string => `${s.chain}:${s.address.toLowerCase()}`;

// Destination currencies live on TON — normalize to bounceable form so the same
// jetton master always maps to the same key regardless of how the caller wrote it.
// Falls back to the raw address for non-TON-shaped inputs (e.g. native zero address).
const destinationKey = (d: { address: string }): string => tryToBounceableAddress(d.address) ?? d.address;

const pickToken = (
    tokens: CryptoOnrampDestinationCurrency[],
    key: string | undefined,
): CryptoOnrampDestinationCurrency | null => tokens.find((t) => destinationKey(t) === key) ?? tokens[0] ?? null;

const pickMethod = (
    methods: CryptoOnrampSourceCurrency[],
    key: string | undefined,
): CryptoOnrampSourceCurrency | null => methods.find((m) => sourceKey(m) === key) ?? methods[0] ?? null;

export const useCryptoOnrampTokenState = ({
    tokens,
    paymentMethods,
    defaultDestination,
    defaultSource,
}: UseCryptoOnrampTokenStateOptions) => {
    const [selectedTokenKey, setSelectedTokenKey] = useState<string | undefined>(() =>
        defaultDestination ? destinationKey(defaultDestination) : undefined,
    );
    const [selectedMethodKey, setSelectedMethodKey] = useState<string | undefined>(() =>
        defaultSource ? sourceKey(defaultSource) : undefined,
    );
    const [amount, setAmountRaw] = useState('');
    const [amountInputMode, setAmountInputMode] = useState<CryptoAmountInputMode>('method');

    const selectedToken = useMemo(() => pickToken(tokens, selectedTokenKey), [tokens, selectedTokenKey]);
    const selectedMethod = useMemo(
        () => pickMethod(paymentMethods, selectedMethodKey),
        [paymentMethods, selectedMethodKey],
    );

    // If the current selection is no longer present in the list (provider switch,
    // discovery refresh), snap the stored key to whatever pick* fell back to.
    useEffect(() => {
        if (selectedToken && destinationKey(selectedToken) !== selectedTokenKey) {
            setSelectedTokenKey(destinationKey(selectedToken));
        }
    }, [selectedToken, selectedTokenKey]);
    useEffect(() => {
        if (selectedMethod && sourceKey(selectedMethod) !== selectedMethodKey) {
            setSelectedMethodKey(sourceKey(selectedMethod));
        }
    }, [selectedMethod, selectedMethodKey]);

    const setSelectedToken = useCallback(
        (token: CryptoOnrampDestinationCurrency) => setSelectedTokenKey(destinationKey(token)),
        [],
    );
    const setSelectedMethod = useCallback(
        (method: CryptoOnrampSourceCurrency) => setSelectedMethodKey(sourceKey(method)),
        [],
    );

    const amountDecimals =
        amountInputMode === 'method' ? (selectedMethod?.decimals ?? 0) : (selectedToken?.decimals ?? 0);

    const setAmount = useCallback(
        (value: string) => {
            if (value === '' || validateNumericString(value, amountDecimals)) setAmountRaw(value);
        },
        [amountDecimals],
    );

    return {
        selectedToken,
        setSelectedToken,
        selectedMethod,
        setSelectedMethod,
        amount,
        setAmount,
        amountInputMode,
        setAmountInputMode,
        amountDecimals,
    };
};
