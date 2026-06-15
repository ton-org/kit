/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useEffect, useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useJettons, useRates, useWallet, useWalletKit } from '@demo/wallet-core';
import type { JettonInfo } from '@ton/walletkit';

import { AssetRow, AssetRowSkeleton, imageSources, useAssetRows } from '@/features/assets';
import type { AssetRowData } from '@/features/assets';
import { getJettonsName, getJettonsSymbol } from '@/features/jettons';
import { findRate, formatRate, toDecimal, tokenImageUrls } from '@/core/utils';

const JETTON_SLOTS = 2;

// Always-shown fallback jettons (used to pad the preview to 3 assets when the user
// holds fewer). Metadata is used only when the token isn't in the wallet.
const DEFAULT_JETTONS: { address: string; symbol: string; name: string }[] = [
    { address: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs', symbol: 'USDT', name: 'Tether USD' },
    { address: 'EQA1R_LuQCLHlMgOo1S4G7Y7W1cd0FrAkbA10Zq7rddKxi9k', symbol: 'XAUT', name: 'Tether Gold' },
];

export const DashboardAssets: React.FC = () => {
    const navigate = useNavigate();
    const { currentWallet, getActiveWallet } = useWallet();
    const { userJettons } = useJettons();
    const { entries: rates } = useRates();
    const walletKit = useWalletKit();
    const { tonRow, jettonRows, assetsReady } = useAssetRows();

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

    // Preview: top JETTON_SLOTS held jettons, padded with default tokens (USDT/XAUT) on mainnet.
    const selected = useMemo<AssetRowData[]>(() => {
        const base = jettonRows.slice(0, JETTON_SLOTS);
        if (!isMainnet || base.length >= JETTON_SLOTS) return base;

        const heldByAddress = new Map(userJettons.map((jetton) => [jetton.address, jetton]));
        const present = new Set(base.map((row) => row.id));
        const padded = [...base];

        for (const def of DEFAULT_JETTONS) {
            if (padded.length >= JETTON_SLOTS) break;
            if (present.has(def.address)) continue;

            const held = heldByAddress.get(def.address);
            const info = defaultInfos[def.address];
            const decimals = held?.decimalsNumber ?? info?.decimals ?? 9;
            const amount = held ? toDecimal(held.balance, decimals) : 0;
            const rateEntry = findRate(rates, def.address);
            padded.push({
                id: def.address,
                icon: held
                    ? imageSources(tokenImageUrls(held.info?.image), held.info?.image?.data)
                    : imageSources(info?.image ? [info.image] : undefined, info?.image_data),
                fallbackText: def.symbol.slice(0, 2).toUpperCase(),
                name: (held && getJettonsName(held)) || info?.name || def.name,
                symbol: (held && getJettonsSymbol(held)) || info?.symbol || def.symbol,
                amount,
                rateLabel: rateEntry ? formatRate(rateEntry.rate) : undefined,
                fiat: rateEntry ? amount * rateEntry.rate : undefined,
            });
        }
        return padded;
    }, [jettonRows, isMainnet, userJettons, rates, defaultInfos]);

    return (
        <section>
            <button
                type="button"
                onClick={() => navigate('/wallet/assets')}
                className="flex items-center gap-1 mb-2"
                aria-label="View all assets"
            >
                <h2 className="text-base font-semibold text-gray-900">Assets</h2>
                <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            <div className="space-y-1">
                {tonRow ? <AssetRow {...tonRow} /> : <AssetRowSkeleton />}
                {assetsReady ? (
                    selected.map((row) => <AssetRow key={row.id} {...row} />)
                ) : (
                    <>
                        <AssetRowSkeleton />
                        <AssetRowSkeleton />
                    </>
                )}
            </div>
        </section>
    );
};
