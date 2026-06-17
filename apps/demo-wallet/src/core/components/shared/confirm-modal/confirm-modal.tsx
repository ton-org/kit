/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';

import { Modal } from '@/core/components/ui/modal';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    /** Style the confirm action as destructive (red). */
    danger?: boolean;
    onConfirm: () => void;
    onClose: () => void;
}

/** Generic confirm/cancel modal (drawer on mobile, dialog on desktop). */
export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    danger = false,
    onConfirm,
    onClose,
}) => (
    <Modal.Container isOpened={isOpen} onOpenChange={(open) => !open && onClose()} className="px-2">
        <Modal.Header onClose={onClose}>
            <Modal.Title>{title}</Modal.Title>
        </Modal.Header>

        {description && (
            <Modal.Body>
                <p className="text-base text-gray-500">{description}</p>
            </Modal.Body>
        )}

        <Modal.Footer>
            <button
                type="button"
                onClick={onConfirm}
                className={`w-full py-4 rounded-2xl text-base font-bold text-white transition-colors ${
                    danger ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
                {confirmLabel}
            </button>
            <button
                type="button"
                onClick={onClose}
                className="w-full py-4 rounded-2xl bg-gray-100 text-gray-900 text-base font-bold hover:bg-gray-200 transition-colors"
            >
                {cancelLabel}
            </button>
        </Modal.Footer>
    </Modal.Container>
);
