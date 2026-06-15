/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';

import { Modal } from '@/core/components/ui/modal';
import { HoldToSignButton } from '@/core/components/ui/hold-to-sign-button';

interface SavePhraseConfirmModalProps {
    isOpen: boolean;
    /** Disables the gesture and shows a spinner while the wallet is being created. */
    loading?: boolean;
    onClose: () => void;
    /** Fires once the user finishes the hold-to-continue gesture. */
    onConfirm: () => void;
}

/**
 * Final guard before creating the wallet: the user must confirm they really
 * stored the recovery phrase, gated behind a deliberate hold-to-continue gesture
 * instead of a one-tap checkbox.
 */
export const SavePhraseConfirmModal: React.FC<SavePhraseConfirmModalProps> = ({
    isOpen,
    loading = false,
    onClose,
    onConfirm,
}) => (
    <Modal.Container isOpened={isOpen} onOpenChange={(open) => !open && onClose()} className="px-2">
        <Modal.Header onClose={onClose}>
            <Modal.Title>Have you saved it?</Modal.Title>
        </Modal.Header>

        <Modal.Body>
            <p className="text-base text-gray-500">
                Make sure you’ve written down all 24 words and stored them somewhere safe. Without your recovery phrase
                you won’t be able to restore this wallet.
            </p>
        </Modal.Body>

        <Modal.Footer>
            <HoldToSignButton
                onComplete={onConfirm}
                loading={loading}
                holdDuration={1500}
                idleLabel="Hold to continue"
                completeLabel="Done!"
                testId="save-phrase-hold"
            />
        </Modal.Footer>
    </Modal.Container>
);
