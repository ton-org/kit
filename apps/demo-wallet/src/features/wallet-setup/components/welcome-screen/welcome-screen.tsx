/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@demo/wallet-core';

import { AddWalletModal } from '../add-wallet-modal';
import type { AddWalletMode } from '../add-wallet-modal';
import { WALLET_SETUP_ROUTE } from '../../routes';
import type { WalletSetupMode } from '../../routes';

import { CenteredScreen } from '@/core/components/shared/centered-screen';
import { Button } from '@/core/components/ui/button';

/** First screen for a brand-new user: intro + entry into wallet setup. */
export const WelcomeScreen: React.FC = () => {
    const navigate = useNavigate();
    const { isPasswordSet } = useAuth();
    const [isAddOpen, setIsAddOpen] = useState(false);

    // Brand-new users set a PIN first; an already-authenticated user (no wallet) goes straight in.
    const start = (tab: WalletSetupMode) => {
        if (isPasswordSet) navigate(WALLET_SETUP_ROUTE[tab]);
        else navigate('/setup-password', { state: { tab } });
    };

    const handleAddExisting = (mode: AddWalletMode) => {
        setIsAddOpen(false);
        start(mode);
    };

    const footer = (
        <div className="space-y-2">
            <Button fullWidth onClick={() => start('create')}>
                Create a new wallet
            </Button>
            <Button variant="secondary" fullWidth onClick={() => setIsAddOpen(true)}>
                Add an existing wallet
            </Button>
            <p className="pt-1 text-center text-xs text-gray-400">
                By continuing, you agree to the{' '}
                <a href="#" className="text-blue-500">
                    Terms
                </a>{' '}
                and{' '}
                <a href="#" className="text-blue-500">
                    Privacy Policy
                </a>
            </p>
        </div>
    );

    return (
        <CenteredScreen footer={footer}>
            <div className="flex flex-col items-center text-center px-6">
                <img src="/favicon.svg" alt="WalletKit" className="w-40 h-40 object-contain" />
                <h1 className="mt-6 text-2xl font-bold text-gray-900">Your TON wallet</h1>
                <p className="mt-2 text-base text-gray-500">
                    Create a new wallet or add an existing one to start sending and receiving GRAM.
                </p>
            </div>

            <AddWalletModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onSelect={handleAddExisting} />
        </CenteredScreen>
    );
};
