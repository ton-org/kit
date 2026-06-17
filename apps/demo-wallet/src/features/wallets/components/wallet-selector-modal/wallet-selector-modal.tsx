/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useWallet } from '@demo/wallet-core';

import { WalletRow } from '../wallet-row';

import { Modal } from '@/core/components/ui/modal';
import { AddWalletModal, WALLET_SETUP_ROUTE } from '@/features/wallet-setup';
import type { AddWalletMode } from '@/features/wallet-setup';

interface WalletSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const WalletSelectorModal: React.FC<WalletSelectorModalProps> = ({ isOpen, onClose }) => {
    const { savedWallets, activeWalletId, switchWallet, renameWallet, removeWallet } = useWallet();
    const navigate = useNavigate();
    const [isAddOpen, setIsAddOpen] = useState(false);

    const handleSelect = async (walletId: string) => {
        if (walletId !== activeWalletId) {
            try {
                await switchWallet(walletId);
            } catch {
                // ignore — store surfaces errors via its own state
            }
        }
        onClose();
    };

    // Already authenticated here — go straight to the chosen setup screen, no password step.
    const handleAddSelect = (mode: AddWalletMode) => {
        setIsAddOpen(false);
        onClose();
        navigate(WALLET_SETUP_ROUTE[mode]);
    };

    return (
        <>
            <Modal.Container
                isOpened={isOpen && !isAddOpen}
                onOpenChange={(open) => !open && onClose()}
                className="px-2"
            >
                <Modal.Header onClose={onClose}>
                    <Modal.Title>Wallets</Modal.Title>
                </Modal.Header>

                <Modal.Body className="px-2 pb-2">
                    {savedWallets.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">No wallets yet</p>
                    ) : (
                        savedWallets.map((wallet) => (
                            <WalletRow
                                key={wallet.id}
                                wallet={wallet}
                                isActive={wallet.id === activeWalletId}
                                onSelect={() => handleSelect(wallet.id)}
                                onRename={renameWallet}
                                onRemove={removeWallet}
                            />
                        ))
                    )}
                </Modal.Body>

                <Modal.Footer className="items-center">
                    <button
                        type="button"
                        onClick={() => setIsAddOpen(true)}
                        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-base font-semibold px-4 py-2 rounded-full hover:scale-[1.03] active:scale-[0.97] transition-transform"
                    >
                        <Plus className="w-5 h-5" strokeWidth={2.5} />
                        Add wallet
                    </button>
                </Modal.Footer>
            </Modal.Container>

            <AddWalletModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onSelect={handleAddSelect} />
        </>
    );
};
