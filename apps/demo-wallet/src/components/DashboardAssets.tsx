/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useEffect, useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { useJettons, useRates, useWallet, useWalletKit } from '@demo/wallet-core';
import type { JettonInfo } from '@ton/walletkit';

import { DashboardAssetRow, DashboardAssetRowSkeleton } from './DashboardAssetRow';

import { getJettonsName, getJettonsSymbol } from '@/utils/jetton';
import { findRate, formatRate, toDecimal } from '@/utils';

const TON_DECIMALS = 9;
const JETTON_SLOTS = 2;

// Always-shown fallback jettons (used to pad the list to 3 assets when the user
// holds fewer). Metadata is used only when the token isn't in the wallet.
const DEFAULT_JETTONS: { address: string; symbol: string; name: string }[] = [
    { address: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs', symbol: 'USDT', name: 'Tether USD' },
    { address: 'EQA1R_LuQCLHlMgOo1S4G7Y7W1cd0FrAkbA10Zq7rddKxi9k', symbol: 'XAUT', name: 'Tether Gold' },
];

// Candidate icon URLs (best-first), appending the inline base64 image as a last resort.
const imageSources = (urls: string[] | undefined, dataBase64?: string): string[] => [
    ...(urls ?? []),
    ...(dataBase64 ? [`data:image/png;base64,${dataBase64}`] : []),
];

interface AssetRowData {
    id: string;
    icon?: string | string[];
    fallbackText: string;
    name: string;
    symbol: string;
    amount: number;
    rateLabel?: string;
    fiat?: number;
    change24h?: number;
}

export const DashboardAssets: React.FC = () => {
    const { balance, currentWallet, getActiveWallet } = useWallet();
    const { userJettons, lastJettonsUpdate } = useJettons();
    const { entries: rates, lastUpdated: ratesUpdated } = useRates();
    const walletKit = useWalletKit();

    const ratesLoaded = ratesUpdated > 0;
    const hasJettonsLoaded = lastJettonsUpdate > 0;
    const hasBalance = balance !== undefined;
    // Show TON and jettons strictly together: all skeletons until balances AND rates are loaded.
    const assetsReady = hasBalance && hasJettonsLoaded && ratesLoaded;
    const isMainnet = getActiveWallet()?.network === 'mainnet';

    // Fetch metadata (name/icon) for the default tokens from the API — mainnet only.
    const [defaultInfos, setDefaultInfos] = useState<Record<string, JettonInfo>>({});
    useEffect(() => {
        if (!isMainnet || !walletKit || !currentWallet) return;
        const network = currentWallet.getNetwork();
        let cancelled = false;
        void Promise.all(
            DEFAULT_JETTONS.map((def) => walletKit.jettons.getJettonInfo(def.address, network).catch(() => null)),
        ).then((infos) => {
            if (cancelled) return;
            const next: Record<string, JettonInfo> = {};
            infos.forEach((info, i) => {
                if (info) next[DEFAULT_JETTONS[i].address] = info;
            });
            setDefaultInfos(next);
        });
        return () => {
            cancelled = true;
        };
    }, [isMainnet, walletKit, currentWallet]);

    const tonRow = useMemo<AssetRowData | null>(() => {
        if (!assetsReady) return null;
        const rateEntry = rates['TON'];
        const amount = toDecimal(balance, TON_DECIMALS);
        return {
            id: 'TON',
            icon: '/ton.svg',
            fallbackText: 'TN',
            name: 'Toncoin',
            symbol: 'TON',
            amount,
            rateLabel: rateEntry ? formatRate(rateEntry.rate) : undefined,
            fiat: rateEntry ? amount * rateEntry.rate : undefined,
            change24h: rateEntry?.change24h,
        };
    }, [assetsReady, balance, rates]);

    const jettonRows = useMemo<AssetRowData[]>(() => {
        if (!assetsReady) return [];

        const entries = userJettons.map((jetton) => {
            const rateEntry = findRate(rates, jetton.address);
            const decimals = jetton.decimalsNumber ?? 9;
            const amount = toDecimal(jetton.balance, decimals);
            const fiat = rateEntry ? amount * rateEntry.rate : undefined;
            const symbol = getJettonsSymbol(jetton) ?? '';
            return {
                row: {
                    id: jetton.address,
                    icon: imageSources(jetton.info?.image?.urls, jetton.info?.image?.data),
                    fallbackText: symbol.slice(0, 2).toUpperCase() || '??',
                    name: getJettonsName(jetton) ?? symbol,
                    symbol,
                    amount,
                    rateLabel: rateEntry ? formatRate(rateEntry.rate) : undefined,
                    fiat,
                    change24h: rateEntry?.change24h,
                } satisfies AssetRowData,
                isVerified: jetton.isVerified,
                hasRate: Boolean(rateEntry),
            };
        });

        // Pick the user's own jettons first: by fiat if any have value, else by verified status.
        const withPositiveFiat = entries.filter((entry) => (entry.row.fiat ?? 0) > 0);
        let selected: AssetRowData[];
        if (withPositiveFiat.length > 0) {
            selected = withPositiveFiat
                .sort((a, b) => (b.row.fiat ?? 0) - (a.row.fiat ?? 0))
                .slice(0, JETTON_SLOTS)
                .map((entry) => entry.row);
        } else {
            const withRate = entries.filter((entry) => entry.hasRate);
            const base = withRate.length > 0 ? withRate : entries;
            selected = base
                .sort((a, b) => Number(b.isVerified) - Number(a.isVerified))
                .slice(0, JETTON_SLOTS)
                .map((entry) => entry.row);
        }

        // On mainnet always show JETTON_SLOTS rows — pad with default tokens
        // (USDT/XAUT) the user doesn't already have shown.
        if (isMainnet && selected.length < JETTON_SLOTS) {
            const heldByAddress = new Map(userJettons.map((jetton) => [jetton.address, jetton]));
            const present = new Set(selected.map((row) => row.id));

            for (const def of DEFAULT_JETTONS) {
                if (selected.length >= JETTON_SLOTS) break;
                if (present.has(def.address)) continue;

                const held = heldByAddress.get(def.address);
                const info = defaultInfos[def.address];
                const decimals = held?.decimalsNumber ?? info?.decimals ?? 9;
                const amount = held ? toDecimal(held.balance, decimals) : 0;
                const rateEntry = findRate(rates, def.address);
                selected.push({
                    id: def.address,
                    icon: held
                        ? imageSources(held.info?.image?.urls, held.info?.image?.data)
                        : imageSources(info?.images, info?.image_data),
                    fallbackText: def.symbol.slice(0, 2).toUpperCase(),
                    name: (held && getJettonsName(held)) || info?.name || def.name,
                    symbol: (held && getJettonsSymbol(held)) || info?.symbol || def.symbol,
                    amount,
                    rateLabel: rateEntry ? formatRate(rateEntry.rate) : undefined,
                    fiat: rateEntry ? amount * rateEntry.rate : undefined,
                    change24h: rateEntry?.change24h,
                });
            }
        }

        return selected;
    }, [assetsReady, isMainnet, userJettons, rates, defaultInfos]);

    return (
        <section>
            <header className="flex items-center gap-1 mb-2">
                <h2 className="text-base font-semibold text-gray-900">Assets</h2>
                <ChevronRight className="w-4 h-4 text-gray-400" />
            </header>

            <div className="space-y-1">
                {tonRow ? <DashboardAssetRow {...tonRow} /> : <DashboardAssetRowSkeleton />}
                {assetsReady ? (
                    jettonRows.map((row) => <DashboardAssetRow key={row.id} {...row} />)
                ) : (
                    <>
                        <DashboardAssetRowSkeleton />
                        <DashboardAssetRowSkeleton />
                    </>
                )}
            </div>
        </section>
    );
};
