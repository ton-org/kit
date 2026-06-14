/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect } from 'react';
import { useAuth, useJettons, useNfts, useRates, useWallet } from '@demo/wallet-core';

export const useWalletDataUpdater = () => {
    const { address, updateBalance, hasWallet, currentWallet, loadAllWallets } = useWallet();
    const { isUnlocked } = useAuth();
    const { loadUserJettons, clearJettons } = useJettons();
    const { loadUserNfts, clearNfts, refreshNfts } = useNfts();
    const { loadRates, clearRates } = useRates();

    // Load wallets when hasWallet but currentWallet missing (e.g. refresh on /send before rehydration)
    useEffect(() => {
        if (hasWallet && isUnlocked && !currentWallet) {
            void loadAllWallets();
        }
    }, [hasWallet, isUnlocked, currentWallet, loadAllWallets]);

    // Update on address change
    useEffect(() => {
        if (!address) return;

        clearNfts();
        clearJettons();
        clearRates();

        void (async () => {
            await Promise.allSettled([updateBalance(), loadUserJettons(), loadUserNfts()]);
            await loadRates();
        })();
    }, [address, updateBalance, loadUserJettons, loadUserNfts, loadRates, clearNfts, clearJettons, clearRates]);

    // Periodic refresh — sequential to avoid overloading the backend (ported from main):
    // balance → jettons → rates → NFTs, chained via setTimeout, every 20s. Rates self-throttle
    // to 60s (see loadRates), so re-requesting on each tick is cheap.
    useEffect(() => {
        if (!address) return;

        let cancelled = false;
        let timeout: ReturnType<typeof setTimeout>;
        const refreshInterval = 30_000;

        const tick = async () => {
            await updateBalance().catch(() => {});
            if (cancelled) return;
            await loadUserJettons().catch(() => {});
            if (cancelled) return;
            await loadRates().catch(() => {});
            if (cancelled) return;
            await refreshNfts().catch(() => {});
            if (cancelled) return;
            timeout = setTimeout(() => void tick(), refreshInterval);
        };

        timeout = setTimeout(() => void tick(), refreshInterval);

        return () => {
            cancelled = true;
            clearTimeout(timeout);
        };
    }, [address, updateBalance, loadUserJettons, loadRates, refreshNfts]);
};
