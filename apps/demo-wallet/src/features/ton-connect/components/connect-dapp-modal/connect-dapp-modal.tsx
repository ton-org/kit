/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useCallback, useState } from 'react';
import { useTonConnect } from '@demo/wallet-core';

import { Button } from '@/components/Button';
import { Modal } from '@/core/components/ui/modal';

interface ConnectDappModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ConnectDappModal: React.FC<ConnectDappModalProps> = ({ isOpen, onClose }) => {
    const { handleTonConnectUrl } = useTonConnect();
    const [url, setUrl] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);

    const handleConnect = useCallback(async () => {
        const trimmed = url.trim();
        if (!trimmed) return;

        setIsConnecting(true);
        try {
            await handleTonConnectUrl(trimmed);
            setUrl('');
            onClose();
        } catch {
            // connect modal / error state handled by the store
        } finally {
            setIsConnecting(false);
        }
    }, [url, handleTonConnectUrl, onClose]);

    return (
        <Modal.Container isOpened={isOpen} onOpenChange={(open) => !open && onClose()} className="px-2">
            <Modal.Header onClose={onClose}>
                <Modal.Title>Connect to dApp</Modal.Title>
            </Modal.Header>

            <Modal.Body className="gap-4">
                <label htmlFor="tonconnect-url" className="block text-sm font-medium text-gray-700">
                    Paste TON Connect link
                </label>
                <textarea
                    id="tonconnect-url"
                    data-testid="tonconnect-url"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl resize-none text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="tc://… or ton://… or https://…"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                />
                <Button
                    data-testid="tonconnect-process"
                    onClick={handleConnect}
                    isLoading={isConnecting}
                    disabled={!url.trim() || isConnecting}
                    className="w-full"
                >
                    Connect
                </Button>
            </Modal.Body>
        </Modal.Container>
    );
};
