/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect, useRef } from 'react';
import { ArrowDownLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useJettons, useRates, useWallet } from '@demo/wallet-core';
import type { RateEntry } from '@demo/wallet-core';

import { getJettonsSymbol } from '@/features/jettons';
import { formatLargeValue, toDecimal } from '@/core/utils';

const GRAM_KEY = 'GRAM';
const GRAM_DECIMALS = 9;

const safeBigInt = (value: string | undefined): bigint | null => {
    if (!value) return null;
    try {
        return BigInt(value);
    } catch {
        return null;
    }
};

const ReceivedIcon = (
    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-100">
        <ArrowDownLeft className="w-3.5 h-3.5 text-green-600" strokeWidth={2.5} />
    </span>
);

const toastReceived = (amount: number, symbol: string, rate?: number): void => {
    const fiat = rate ? ` ($${formatLargeValue(String(amount * rate), 2, 2)})` : '';
    toast(`You received ${formatLargeValue(String(amount), 4)} ${symbol}${fiat}`.trim(), { icon: ReceivedIcon });
};

/**
 * Shows a "You received …" toast whenever an asset balance grows. Tracks the
 * previous raw balance per asset; the first observation after a load (or wallet
 * switch) just seeds the baseline without toasting. Sends/decreases are ignored.
 */
export const useReceivedToasts = (): void => {
    const { address, balance } = useWallet();
    const { userJettons, lastJettonsUpdate } = useJettons();
    const { entries: rates } = useRates();

    const balancesRef = useRef<Map<string, bigint>>(new Map());
    const tonSeededRef = useRef(false);
    const jettonsSeededRef = useRef(false);

    // Always read the latest rates without making them an effect dependency.
    const ratesRef = useRef<Record<string, RateEntry>>(rates);
    ratesRef.current = rates;

    // New wallet → reset the baseline so cross-wallet diffs never toast.
    useEffect(() => {
        balancesRef.current.clear();
        tonSeededRef.current = false;
        jettonsSeededRef.current = false;
    }, [address]);

    // TON balance.
    useEffect(() => {
        const next = safeBigInt(balance);
        if (next === null) return;

        const prev = balancesRef.current.get(GRAM_KEY);
        balancesRef.current.set(GRAM_KEY, next);

        if (!tonSeededRef.current) {
            tonSeededRef.current = true;
            return;
        }
        if (prev !== undefined && next > prev) {
            toastReceived(toDecimal(next - prev, GRAM_DECIMALS), 'GRAM', ratesRef.current[GRAM_KEY]?.rate);
        }
    }, [balance]);

    // Jettons.
    useEffect(() => {
        if (lastJettonsUpdate === 0) return; // not loaded yet — avoid false baseline

        if (!jettonsSeededRef.current) {
            for (const jetton of userJettons) {
                const value = safeBigInt(jetton.balance);
                if (value !== null) balancesRef.current.set(jetton.address, value);
            }
            jettonsSeededRef.current = true;
            return;
        }

        for (const jetton of userJettons) {
            const next = safeBigInt(jetton.balance);
            if (next === null) continue;

            const prev = balancesRef.current.get(jetton.address) ?? 0n;
            balancesRef.current.set(jetton.address, next);

            if (next > prev) {
                const decimals = jetton.decimalsNumber ?? 9;
                const symbol = getJettonsSymbol(jetton) ?? '';
                toastReceived(toDecimal(next - prev, decimals), symbol, ratesRef.current[jetton.address]?.rate);
            }
        }
    }, [userJettons, lastJettonsUpdate]);
};
