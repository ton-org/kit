/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateTonMnemonic } from '@ton/walletkit';
import { useAuth } from '@demo/wallet-core';
import type { NetworkType } from '@demo/wallet-core';
import { toast } from 'sonner';

import { CenteredScreen } from '@/core/components/shared/centered-screen';
import { Button } from '@/core/components/ui/button';
import { NetworkSelector } from '@/components/NetworkSelector';
import { useTonWallet } from '@/hooks';

/** Dedicated "Recovery phrase" screen for creating a new wallet. */
export const CreateWalletScreen: React.FC = () => {
    const navigate = useNavigate();
    const { importWallet } = useTonWallet();
    const { setUseWalletInterfaceType } = useAuth();

    const [mnemonic, setMnemonic] = useState<string[]>([]);
    const [network, setNetwork] = useState<NetworkType>('mainnet');
    const [revealed, setRevealed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        void (async () => {
            try {
                setMnemonic(await CreateTonMnemonic());
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to generate recovery phrase');
            }
        })();
    }, []);

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(mnemonic.join(' '));
            toast.success('Recovery phrase copied');
        } catch {
            toast.error('Failed to copy');
        }
    }, [mnemonic]);

    const handleContinue = async () => {
        setError('');
        setIsLoading(true);
        try {
            setUseWalletInterfaceType('mnemonic');
            await importWallet(mnemonic, 'v5r1', network);
            navigate('/wallet');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create wallet');
        } finally {
            setIsLoading(false);
        }
    };

    const ready = mnemonic.length > 0;
    const columns = [0, 12];

    const footer = (
        <Button fullWidth onClick={handleContinue} disabled={!revealed || isLoading}>
            Continue
        </Button>
    );

    return (
        <CenteredScreen onBack={() => navigate(-1)} footer={footer}>
            <div className="px-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Recovery phrase</h1>
                    <p className="mt-2 text-base text-gray-500">
                        This is the only way you will be able to recover your account. Please store it somewhere safe!
                    </p>
                </div>

                <div className="mt-4">
                    <NetworkSelector value={network} onChange={setNetwork} compact />
                </div>

                <div className="relative mt-6">
                    <div className={revealed ? 'select-text' : 'blur-sm'}>
                        <div className="flex gap-6">
                            {columns.map((offset) => (
                                <div key={offset} className="flex-1 space-y-4">
                                    {(ready ? mnemonic : Array.from({ length: 24 }).map(() => ''))
                                        .slice(offset, offset + 12)
                                        .map((word, idx) => {
                                            const n = offset + idx + 1;
                                            return (
                                                <div key={n} className="flex items-baseline gap-3">
                                                    <span className="w-6 text-gray-400 tabular-nums">{n}</span>
                                                    <span className="font-bold text-gray-900">{word || '—'}</span>
                                                </div>
                                            );
                                        })}
                                </div>
                            ))}
                        </div>
                    </div>

                    {!revealed && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Button variant="primary" size="sm" onClick={() => setRevealed(true)} disabled={!ready}>
                                Click to reveal
                            </Button>
                        </div>
                    )}
                </div>

                <div className="mt-6 flex justify-center">
                    <Button variant="gray" size="sm" onClick={handleCopy} disabled={!revealed}>
                        Copy phrase
                    </Button>
                </div>

                {error && <p className="mt-4 text-center text-sm text-red-500">{error}</p>}
            </div>
        </CenteredScreen>
    );
};
