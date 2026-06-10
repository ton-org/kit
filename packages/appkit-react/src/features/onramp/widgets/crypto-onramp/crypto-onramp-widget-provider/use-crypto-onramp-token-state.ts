/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useCallback, useState } from 'react';
import { validateNumericString } from '@ton/appkit';
import type { CryptoOnrampDestinationCurrency, CryptoOnrampSourceCurrency } from '@ton/appkit';

import type { CryptoAmountInputMode } from './crypto-onramp-context';

export const useCryptoOnrampTokenState = () => {
    // Selection starts empty and is resolved by the provider once `supportedCurrencies`
    // loads (consumer defaults are looked up there by address) — until then the UI shows
    // skeletons/placeholders. Selected objects therefore always come from the live list.
    const [selectedToken, setSelectedToken] = useState<CryptoOnrampDestinationCurrency | null>(null);
    const [selectedMethod, setSelectedMethod] = useState<CryptoOnrampSourceCurrency | null>(null);
    const [amount, setAmountRaw] = useState('');
    const [amountInputMode, setAmountInputMode] = useState<CryptoAmountInputMode>('method');

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
