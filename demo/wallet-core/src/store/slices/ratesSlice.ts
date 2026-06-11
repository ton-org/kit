/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Address } from '@ton/core';

import { createComponentLogger } from '../../utils/logger';
import type { SetState, RateEntry, RatesSliceCreator } from '../../types/store';

const log = createComponentLogger('RatesSlice');

// DYOR public markets API. `order=desc` returns the most liquid jettons first
// (asc returns zero-liquidity tokens with no price). TON itself is included
// under the all-zero master address. This endpoint does not expose a 24h change.
const RATES_ENDPOINT = 'https://api.dyor.io/v1/jettons?sort=liquidityUsd&order=desc&currency=ton&limit=100';
const RAW_TON_ADDRESS = '0:0000000000000000000000000000000000000000000000000000000000000000';

// Skip a refresh if rates were updated within this window (clearRates resets the timer).
const RATES_TTL_MS = 60_000;

// DYOR occasionally rate-limits (HTTP 429). Retry once after a short delay.
const RETRY_DELAY_MS = 2000;

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/** Fetch rates, retrying once after a 2s delay if DYOR responds with 429. */
const fetchRates = async (): Promise<Response> => {
    const response = await fetch(RATES_ENDPOINT, { headers: { accept: 'application/json' } });

    if (response.status === 429) {
        log.warn('Rates rate-limited (429), retrying in 2s');
        await sleep(RETRY_DELAY_MS);
        return fetch(RATES_ENDPOINT, { headers: { accept: 'application/json' } });
    }

    return response;
};

interface DyorMoney {
    value: string;
    decimals: number;
}

interface DyorJetton {
    metadata: { address: string };
    priceUsd?: DyorMoney;
}

interface DyorResponse {
    jettons: DyorJetton[];
}

const moneyToNumber = (money?: DyorMoney): number => {
    if (!money) return 0;
    const value = Number(money.value);
    if (!Number.isFinite(value)) return 0;
    return value / 10 ** money.decimals;
};

// Start empty — rates (including TON) come from the API; no hardcoded fallback.
const initialEntries = (): Record<string, RateEntry> => ({});

export const createRatesSlice: RatesSliceCreator = (set: SetState, get) => ({
    rates: {
        entries: initialEntries(),
        isLoading: false,
        error: null,
        lastUpdated: 0,
    },

    loadRates: async () => {
        const { isLoading, lastUpdated, error } = get().rates;
        // Avoid overlapping fetches. Throttle only successful loads within the TTL window;
        // after a failure (error set) keep retrying so a failed cold start recovers quickly.
        if (isLoading) return;
        if (!error && lastUpdated > 0 && Date.now() - lastUpdated < RATES_TTL_MS) return;

        set((state) => {
            state.rates.isLoading = true;
            state.rates.error = null;
        });

        try {
            const response = await fetchRates();
            if (!response.ok) {
                throw new Error(`Rates request failed: ${response.status}`);
            }

            const data: DyorResponse = await response.json();
            const entries: Record<string, RateEntry> = initialEntries();

            for (const jetton of data.jettons ?? []) {
                const rate = moneyToNumber(jetton.priceUsd);
                if (rate <= 0) continue;

                const rawAddress = jetton.metadata.address;
                if (rawAddress === RAW_TON_ADDRESS) {
                    entries.TON = { rate, currency: 'USD' };
                    continue;
                }

                // Derive the friendly (bounceable) address ourselves so we keep every
                // jetton's rate, not only those present in the response's address book.
                let key: string;
                try {
                    key = Address.parse(rawAddress).toString();
                } catch {
                    continue;
                }
                entries[key] = { rate, currency: 'USD' };
            }

            set((state) => {
                state.rates.entries = entries;
                state.rates.lastUpdated = Date.now();
                state.rates.isLoading = false;
                state.rates.error = null;
            });

            log.info('Rates loaded', { count: Object.keys(entries).length });
        } catch (error) {
            log.error('Failed to load rates:', error);
            const message = error instanceof Error ? error.message : 'Failed to load rates';
            set((state) => {
                state.rates.isLoading = false;
                state.rates.error = message;
                // Do not touch lastUpdated on failure: skeletons stay until the first real rate
                // loads, and the !error throttle bypass keeps retrying on the next tick.
            });
        }
    },

    clearRates: () => {
        set((state) => {
            state.rates.entries = initialEntries();
            state.rates.isLoading = false;
            state.rates.error = null;
            state.rates.lastUpdated = 0;
        });
    },

    getRate: (key: string): RateEntry | undefined => {
        return get().rates.entries[key];
    },
});
