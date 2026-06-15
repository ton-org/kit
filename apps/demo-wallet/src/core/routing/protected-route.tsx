/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, useWallet } from '@demo/wallet-core';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiresWallet?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiresWallet = false }) => {
    const { isPasswordSet, isUnlocked } = useAuth();
    const { hasWallet } = useWallet();

    // If no password is set (brand new or after a reset), start from the welcome screen
    if (!isPasswordSet) {
        return <Navigate to="/welcome" replace />;
    }

    // If password is set but wallet is locked, redirect to unlock
    if (!isUnlocked) {
        return <Navigate to="/unlock" replace />;
    }

    // If wallet is required but doesn't exist, send the user to the welcome screen
    if (requiresWallet && !hasWallet) {
        return <Navigate to="/welcome" replace />;
    }

    return <>{children}</>;
};
