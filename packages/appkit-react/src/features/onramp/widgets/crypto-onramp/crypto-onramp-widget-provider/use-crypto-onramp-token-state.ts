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

interface UseCryptoOnrampTokenStateOptions {
    defaultDestination?: CryptoOnrampDestinationCurrency;
    defaultSource?: CryptoOnrampSourceCurrency;
}

export const useCryptoOnrampTokenState = ({ defaultDestination, defaultSource }: UseCryptoOnrampTokenStateOptions) => {
    // Seed from consumer-supplied defaults when given; otherwise leave empty so the UI can
    // show skeletons/placeholders until the user picks. Selection isn't validated against
    // the live list — if the pair isn't supported, the quote request surfaces the
    // provider's error verbatim.
    const [selectedToken, setSelectedToken] = useState<CryptoOnrampDestinationCurrency | null>(
        defaultDestination ?? null,
    );
    const [selectedMethod, setSelectedMethod] = useState<CryptoOnrampSourceCurrency | null>(defaultSource ?? null);
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
