/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { KeyRound, Usb } from 'lucide-react';

import { Modal } from '@/core/components/ui/modal';
import { OptionRow } from '@/core/components/ui/option-row';

export type AddWalletMode = 'import' | 'ledger';

const OPTIONS: { mode: AddWalletMode; title: string; subtitle: string; Icon: typeof KeyRound }[] = [
    { mode: 'import', title: 'Recovery phrase', subtitle: 'Import with 12 or 24 words', Icon: KeyRound },
    { mode: 'ledger', title: 'Ledger', subtitle: 'Connect a hardware wallet', Icon: Usb },
];

interface AddWalletModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** Chosen way to add an existing wallet. */
    onSelect: (mode: AddWalletMode) => void;
}

/** "Add an existing wallet" picker: import via recovery phrase or connect a Ledger. */
export const AddWalletModal: React.FC<AddWalletModalProps> = ({ isOpen, onClose, onSelect }) => (
    <Modal.Container isOpened={isOpen} onOpenChange={(open) => !open && onClose()} className="px-2">
        <Modal.Header onClose={onClose}>
            <Modal.Title>Add an existing wallet</Modal.Title>
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
