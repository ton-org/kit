/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, KeyRound, Lock, Plus, Trash2 } from 'lucide-react';
import { useAuth, useWallet } from '@demo/wallet-core';

import { MnemonicDisplay } from './MnemonicDisplay';
import { ToggleRow } from './ToggleRow';
import { createComponentLogger } from '../utils/logger';

import { Modal } from '@/core/components/ui/modal';
import { SettingsIcon } from '@/core/components/ui/icons';
import { CreateWalletModal, WALLET_SETUP_ROUTE } from '@/features/wallet-setup';
import type { CreateWalletMode } from '@/features/wallet-setup';

const log = createComponentLogger('SettingsDropdown');

interface ActionRowProps {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    danger?: boolean;
    disabled?: boolean;
}

const ActionRow: React.FC<ActionRowProps> = ({ icon, label, onClick, danger = false, disabled = false }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors disabled:opacity-50 ${
            danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-900 hover:bg-gray-100/60'
        }`}
    >
        <span className="flex-shrink-0">{icon}</span>
        <span className="flex-1 text-sm font-semibold">{label}</span>
        <ChevronRight className={`w-4 h-4 flex-shrink-0 ${danger ? 'text-red-400' : 'text-gray-400'}`} />
    </button>
);

export const SettingsDropdown: React.FC = () => {
    const navigate = useNavigate();
    const {
        lock,
        reset,
        persistPassword,
        setPersistPassword,
        holdToSign,
        setHoldToSign,
        showFastSend,
        setShowFastSend,
    } = useAuth();
    const { getDecryptedMnemonic } = useWallet();

    const [panel, setPanel] = useState<'menu' | 'create' | 'mnemonic' | null>(null);
    const [mnemonic, setMnemonic] = useState<string[]>([]);
    const [isLoadingMnemonic, setIsLoadingMnemonic] = useState(false);
    const [mnemonicError, setMnemonicError] = useState('');

    const handleLockWallet = () => {
        setPanel(null);
        lock();
    };

    const handleDeleteWallet = () => {
        if (window.confirm('Are you sure you want to delete your wallet? This action cannot be undone.')) {
            setPanel(null);
            reset();
        }
    };

    const handleCreateNewWallet = () => setPanel('create');

    const handleSelectCreateMode = (mode: CreateWalletMode) => {
        setPanel(null);
        navigate(WALLET_SETUP_ROUTE[mode]);
    };

    const handleViewRecoveryPhrase = async () => {
        setIsLoadingMnemonic(true);
        setMnemonicError('');

        try {
            const decryptedMnemonic = await getDecryptedMnemonic();
            if (decryptedMnemonic) {
                setMnemonic(decryptedMnemonic);
                setPanel('mnemonic');
            } else {
                setMnemonicError('Unable to retrieve recovery phrase. Please ensure you are logged in.');
            }
        } catch (error) {
            setMnemonicError('Failed to decrypt recovery phrase. Please try again.');
            log.error('Error retrieving mnemonic:', error);
        } finally {
            setIsLoadingMnemonic(false);
        }
    };

    const handleCloseMnemonicModal = () => {
        setPanel(null);
        setMnemonic([]);
        setMnemonicError('');
    };

    return (
        <>
            <button
                onClick={() => setPanel('menu')}
                className="p-1.5 -mr-1.5 rounded-md hover:bg-gray-100 transition-colors"
                aria-label="Settings"
                data-testid="wallet-menu"
            >
                <SettingsIcon className="w-6 h-6 text-[#14181F]" />
            </button>

            <Modal.Container
                isOpened={panel === 'menu'}
                onOpenChange={(open) => !open && setPanel(null)}
                className="px-2"
            >
                <Modal.Header onClose={() => setPanel(null)}>
                    <Modal.Title>Settings</Modal.Title>
                </Modal.Header>

                <Modal.Body className="gap-3">
                    <div className="rounded-2xl bg-[#F7F8FA] divide-y divide-gray-200/70 overflow-hidden">
                        <ToggleRow
                            testId="auto-lock"
                            label="Auto-Lock"
                            description="Lock wallet on app reload (more secure)"
                            checked={!persistPassword}
                            onChange={(checked) => setPersistPassword(!checked)}
                            info={
                                <>
                                    <strong>Security notice:</strong> when auto-lock is off, your password is stored
                                    locally and the wallet stays unlocked. Only use for development.
                                </>
                            }
                        />
                        <ToggleRow
                            testId="hold-to-sign"
                            label="Hold to Sign"
                            description="Hold the button for 3 seconds to approve transactions"
                            checked={holdToSign ?? true}
                            onChange={setHoldToSign}
                            info={
                                <>
                                    <strong>Security notice:</strong> disabling hold-to-sign makes it easier to
                                    accidentally approve transactions. Only use for testing.
                                </>
                            }
                        />
                        <ToggleRow
                            testId="show-fast-send"
                            label="Show fast send"
                            description="Show “Send Fast” button (1 nano, no confirmation)"
                            checked={showFastSend ?? false}
                            onChange={setShowFastSend}
                        />
                    </div>

                    <div className="rounded-2xl bg-[#F7F8FA] divide-y divide-gray-200/70 overflow-hidden">
                        <ActionRow
                            icon={<Plus className="w-5 h-5" />}
                            label="Create New Wallet"
                            onClick={handleCreateNewWallet}
                        />
                        <ActionRow
                            icon={<KeyRound className="w-5 h-5" />}
                            label={isLoadingMnemonic ? 'Loading…' : 'View Recovery Phrase'}
                            onClick={handleViewRecoveryPhrase}
                            disabled={isLoadingMnemonic}
                        />
                        <ActionRow icon={<Lock className="w-5 h-5" />} label="Lock Wallet" onClick={handleLockWallet} />
                        <ActionRow
                            icon={<Trash2 className="w-5 h-5" />}
                            label="Delete Wallet"
                            onClick={handleDeleteWallet}
                            danger
                        />
                    </div>

                    {mnemonicError && (
                        <p className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-xl">{mnemonicError}</p>
                    )}
                </Modal.Body>
            </Modal.Container>

            <CreateWalletModal
                isOpen={panel === 'create'}
                onClose={() => setPanel(null)}
                onSelect={handleSelectCreateMode}
            />

            <Modal.Container
                isOpened={panel === 'mnemonic'}
                onOpenChange={(open) => !open && handleCloseMnemonicModal()}
                className="px-2"
            >
                <Modal.Header onClose={handleCloseMnemonicModal}>
                    <Modal.Title>Recovery Phrase</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {mnemonic.length > 0 && (
                        <MnemonicDisplay
                            mnemonic={mnemonic}
                            showWarning
                            warningType="red"
                            warningText="Never share your recovery phrase with anyone. Anyone with access to these words can control your wallet."
                        />
                    )}
                </Modal.Body>
            </Modal.Container>
        </>
    );
};
