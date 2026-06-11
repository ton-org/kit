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

    // Background refresh: balance + jettons every 10s. Rates are requested too but
    // self-throttle to 60s (see loadRates), so this doesn't spam the rates backend.
    useEffect(() => {
        if (!address) return;

        const interval = setInterval(() => {
            void (async () => {
                await Promise.allSettled([updateBalance(), loadUserJettons()]);
                await loadRates();
            })();
        }, 10_000);

        return () => clearInterval(interval);
    }, [address, updateBalance, loadUserJettons, loadRates]);

    // Periodic refresh for NFTs (slower cadence — NFTs change rarely)
    useEffect(() => {
        if (!address) return;

        const timeout = setInterval(() => {
            void refreshNfts();
        }, 60_000);

        return () => clearInterval(timeout);
    }, [address, refreshNfts]);
};
