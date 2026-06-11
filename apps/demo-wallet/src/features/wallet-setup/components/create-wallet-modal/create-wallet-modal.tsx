/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { KeyRound, Plus, Usb } from 'lucide-react';

import { Modal } from '@/core/components/ui/modal';
import { OptionRow } from '@/core/components/ui/option-row';

export type CreateWalletMode = 'create' | 'import' | 'ledger';

const OPTIONS: { mode: CreateWalletMode; title: string; subtitle: string; Icon: typeof KeyRound }[] = [
    { mode: 'create', title: 'New wallet', subtitle: 'Generate a new recovery phrase', Icon: Plus },
    { mode: 'import', title: 'Recovery phrase', subtitle: 'Import with 12 or 24 words', Icon: KeyRound },
    { mode: 'ledger', title: 'Ledger', subtitle: 'Connect a hardware wallet', Icon: Usb },
];

interface CreateWalletModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** Chosen way to add a wallet. */
    onSelect: (mode: CreateWalletMode) => void;
}

/** Wallet picker: create a fresh wallet, import a recovery phrase, or connect a Ledger. */
export const CreateWalletModal: React.FC<CreateWalletModalProps> = ({ isOpen, onClose, onSelect }) => (
    <Modal.Container isOpened={isOpen} onOpenChange={(open) => !open && onClose()} className="px-2">
        <Modal.Header onClose={onClose}>
            <Modal.Title>Add wallet</Modal.Title>
        </Modal.Header>

        <Modal.Body className="px-3 gap-2">
            {OPTIONS.map(({ mode, title, subtitle, Icon }) => (
                <OptionRow
                    key={mode}
                    icon={<Icon className="w-7 h-7" strokeWidth={1.8} />}
                    title={title}
                    subtitle={subtitle}
                    onClick={() => onSelect(mode)}
                />
            ))}
        </Modal.Body>
    </Modal.Container>
);
