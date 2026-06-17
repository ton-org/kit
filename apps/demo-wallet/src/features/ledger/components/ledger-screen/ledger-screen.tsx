/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus } from 'lucide-react';
import { useAuth } from '@demo/wallet-core';
import type { NetworkType } from '@demo/wallet-core';

import { CenteredScreen } from '@/core/components/shared/centered-screen';
import { Button } from '@/core/components/ui/button';
import { NetworkSelector } from '@/features/wallets';
import { useTonWallet } from '@/core/hooks';

/** Dedicated screen for connecting a Ledger hardware wallet. */
export const LedgerScreen: React.FC = () => {
    const navigate = useNavigate();
    const { createLedgerWallet } = useTonWallet();
    const { ledgerAccountNumber, setLedgerAccountNumber, setUseWalletInterfaceType } = useAuth();

    const [network, setNetwork] = useState<NetworkType>('mainnet');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleConnect = async () => {
        setError('');
        setIsLoading(true);
        try {
            setUseWalletInterfaceType('ledger');
            await createLedgerWallet(network);
            navigate('/wallet');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to connect Ledger');
        } finally {
            setIsLoading(false);
        }
    };

    const footer = (
        <Button fullWidth onClick={handleConnect} disabled={isLoading}>
            {isLoading ? 'Connecting…' : 'Connect'}
        </Button>
    );

    return (
        <CenteredScreen onBack={() => navigate(-1)} footer={footer}>
            <div className="px-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Connect Ledger</h1>
                    <p className="mt-2 text-base text-gray-500">Connect your Ledger hardware wallet to continue.</p>
                </div>

                <div className="mt-6 space-y-2">
                    <NetworkSelector value={network} onChange={setNetwork} compact />
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Account</span>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setLedgerAccountNumber(Math.max(0, (ledgerAccountNumber || 0) - 1))}
                                disabled={(ledgerAccountNumber || 0) === 0}
                                aria-label="Decrease account"
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 disabled:opacity-40 transition-colors"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-6 text-center text-base font-semibold tabular-nums">
                                {ledgerAccountNumber || 0}
                            </span>
                            <button
                                type="button"
                                onClick={() => setLedgerAccountNumber((ledgerAccountNumber || 0) + 1)}
                                aria-label="Increase account"
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                    <h3 className="text-sm font-semibold text-yellow-800 mb-2">Before you continue:</h3>
                    <ul className="text-sm text-yellow-700 space-y-1 list-disc pl-5">
                        <li>Connect Ledger via USB</li>
                        <li>Unlock it with your PIN</li>
                        <li>Open the TON app</li>
                    </ul>
                </div>

                {error && <p className="mt-4 text-center text-sm text-red-500">{error}</p>}
            </div>
        </CenteredScreen>
    );
};
