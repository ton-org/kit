/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect } from 'react';
import { useAuth, useJettons, useNfts, useWallet } from '@demo/wallet-core';

export const useWalletDataUpdater = () => {
    const { address, updateBalance, hasWallet, currentWallet, loadAllWallets } = useWallet();
    const { isUnlocked } = useAuth();
    const { loadUserJettons, clearJettons } = useJettons();
    const { loadUserNfts, clearNfts, refreshNfts } = useNfts();

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
        void Promise.allSettled([updateBalance(), loadUserJettons(), loadUserNfts()]);
    }, [address, updateBalance, loadUserJettons, loadUserNfts, clearNfts, clearJettons]);

    // Periodic refresh for balances
    useEffect(() => {
        if (!address) return;

        const interval = setInterval(() => {
            void Promise.allSettled([updateBalance(), loadUserJettons()]);
        }, 15_000);

        return () => clearInterval(interval);
    }, [address, updateBalance, loadUserJettons]);

    // Periodic refresh for NFTs
    useEffect(() => {
        if (!address) return;

        const timeout = setInterval(() => {
            void refreshNfts();
        }, 30_000);

        return () => clearInterval(timeout);
    }, [address, refreshNfts]);
};
