/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useWalletStore, useWallet } from '@demo/wallet-core';

import { ProtectedRoute } from './protected-route';

import { LoaderCircle } from '@/components/LoaderCircle';
import { WalletDashboard, TonConnectRoute } from '@/pages';
import { TracePage, TransactionDetail } from '@/features/transactions';
import { Staking } from '@/features/staking';
import { Swap } from '@/features/swap';
import { SendTransaction } from '@/features/send';
import { SetupPasswordScreen, UnlockScreen } from '@/features/auth';
import { LedgerScreen } from '@/features/ledger';
import { WelcomeScreen, CreateWalletScreen, ImportWalletScreen } from '@/features/wallet-setup';
import { useWalletDataUpdater } from '@/hooks/useWalletDataUpdater';
import { useReceivedToasts } from '@/features/notifications';
import { Button } from '@/components/Button';

export const AppRouter: React.FC = () => {
    const isPasswordSet = useWalletStore((state) => state.auth.isPasswordSet);
    const isUnlocked = useWalletStore((state) => state.auth.isUnlocked);
    const isWalletKitInitialized = useWalletStore((state) => state.walletCore.isWalletKitInitialized);
    const initializationError = useWalletStore((state) => state.walletCore.initializationError);
    const { hasWallet } = useWallet();

    useWalletDataUpdater();
    useReceivedToasts();

    const getInitialRoute = () => {
        if (!isPasswordSet) return '/welcome';
        if (!isUnlocked) return '/unlock';
        if (!hasWallet) return '/welcome';
        return '/wallet';
    };

    if (initializationError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
                    <div className="mb-4">
                        <svg
                            className="mx-auto h-12 w-12 text-red-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Initialization Error</h2>
                    <p className="text-gray-600 mb-6">Failed to initialize wallet. Please reload the page.</p>

                    <Button onClick={() => window.location.reload()} className="w-full cursor-pointer">
                        Reload Page
                    </Button>
                </div>
            </div>
        );
    }

    if (!isWalletKitInitialized) {
        return <LoaderCircle />;
    }

    return (
        <BrowserRouter>
            <Routes>
                {/* Public routes */}
                <Route path="/welcome" element={<WelcomeScreen />} />
                <Route path="/setup-password" element={<SetupPasswordScreen />} />
                <Route path="/unlock" element={<UnlockScreen />} />

                {/* Protected routes - require authentication */}
                <Route
                    path="/create-wallet"
                    element={
                        <ProtectedRoute>
                            <CreateWalletScreen />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/import-wallet"
                    element={
                        <ProtectedRoute>
                            <ImportWalletScreen />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ledger"
                    element={
                        <ProtectedRoute>
                            <LedgerScreen />
                        </ProtectedRoute>
                    }
                />

                {/* Protected routes - require wallet */}
                <Route
                    path="/wallet"
                    element={
                        <ProtectedRoute requiresWallet>
                            <WalletDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/send"
                    element={
                        <ProtectedRoute requiresWallet>
                            <SendTransaction />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/swap"
                    element={
                        <ProtectedRoute requiresWallet>
                            <Swap />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/staking"
                    element={
                        <ProtectedRoute requiresWallet>
                            <Staking />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/wallet/transactions/:hash"
                    element={
                        <ProtectedRoute requiresWallet>
                            <TransactionDetail />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/wallet/trace/:traceId"
                    element={
                        <ProtectedRoute requiresWallet>
                            <TracePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ton-connect"
                    element={
                        <ProtectedRoute requiresWallet>
                            <TonConnectRoute />
                        </ProtectedRoute>
                    }
                />

                {/* Redirect root to appropriate route */}
                <Route path="/" element={<Navigate to={getInitialRoute()} replace />} />

                {/* Catch all - redirect to root */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};
