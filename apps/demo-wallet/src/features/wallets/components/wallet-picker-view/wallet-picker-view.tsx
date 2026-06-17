/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import type { SavedWallet } from '@demo/wallet-core';

import { WalletRow } from '../wallet-row';

import { Modal } from '@/core/components/ui/modal';

interface WalletPickerViewProps {
    onBack: () => void;
    wallets: SavedWallet[];
    selectedId?: string;
    onSelect: (walletId: string) => void;
    title?: string;
}

/**
 * Content-only wallet chooser (back header + list) meant to be embedded as an in-modal view, so it
 * shares the host modal's overlay — switching to it doesn't flicker like a separate stacked modal would.
 * Unlike {@link WalletSelectorModal} it never switches the active wallet and offers no rename/remove/add;
 * it just reports the picked id via {@link onSelect} (used to choose which wallet to connect to a dApp).
 */
export const WalletPickerView: React.FC<WalletPickerViewProps> = ({
    onBack,
    wallets,
    selectedId,
    onSelect,
    title = 'Select wallet',
}) => (
    <>
        <Modal.Header onBack={onBack}>
            <Modal.Title>{title}</Modal.Title>
        </Modal.Header>

        <Modal.Body className="flex-1 overflow-y-auto px-2 pb-4">
            {wallets.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No wallets available</p>
            ) : (
                wallets.map((wallet) => (
                    <WalletRow
                        key={wallet.id}
                        wallet={wallet}
                        isActive={wallet.id === selectedId}
                        onSelect={() => onSelect(wallet.id)}
                    />
                ))
            )}
        </Modal.Body>
    </>
);
