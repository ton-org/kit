/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useMemo } from 'react';
import { useJettons, useRates, useWallet } from '@demo/wallet-core';

import type { TokenOption } from '../types';

import { getJettonsImage, getJettonsName, getJettonsSymbol } from '@/features/jettons';
import { findRate, toDecimal } from '@/core/utils';

const GRAM_DECIMALS = 9;
/** Kept aside on a MAX TON send so the transfer still has gas to pay for itself. */
const TON_GAS_RESERVE = 0.01;

/** Builds the selectable send assets: TON first, then every held jetton. */
export const useSendTokens = (): TokenOption[] => {
    const { balance } = useWallet();
    const { userJettons } = useJettons();
    const { entries: rates } = useRates();

    return useMemo<TokenOption[]>(() => {
        const tonAmount = toDecimal(balance, GRAM_DECIMALS);
        const tonOption: TokenOption = {
            token: { type: 'TON' },
            id: 'TON',
            icon: '/gram.svg',
            fallbackText: 'GR',
            name: 'Gram',
            symbol: 'GRAM',
            decimals: GRAM_DECIMALS,
            balance: tonAmount,
            maxSendable: Math.max(0, tonAmount - TON_GAS_RESERVE),
            rate: rates['TON']?.rate,
        };

        const jettonOptions = userJettons.map((jetton): TokenOption => {
            const decimals = jetton.decimalsNumber ?? GRAM_DECIMALS;
            const amount = toDecimal(jetton.balance, decimals);
            const symbol = getJettonsSymbol(jetton) ?? '';
            return {
                token: { type: 'JETTON', data: jetton },
                id: jetton.address,
                icon: getJettonsImage(jetton),
                fallbackText: symbol.slice(0, 2).toUpperCase() || '??',
                name: getJettonsName(jetton) ?? symbol,
                symbol,
                decimals,
                balance: amount,
                maxSendable: amount,
                rate: findRate(rates, jetton.address)?.rate,
            };
        });

        return [tonOption, ...jettonOptions];
    }, [balance, userJettons, rates]);
};
