/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Address } from '@ton/core';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { useWallet } from '@demo/wallet-core';
import QRCodeStyling from 'qr-code-styling';
import type { Options as QrOptions } from 'qr-code-styling';

import { Modal } from '@/core/components/ui/modal';

const QR_COLOR = '#14181F';

const QR_OPTIONS: Partial<QrOptions> = {
    type: 'svg',
    margin: 0,
    image: '/favicon.svg',
    dotsOptions: { color: QR_COLOR, type: 'rounded' },
    cornersSquareOptions: { color: QR_COLOR, type: 'extra-rounded' },
    cornersDotOptions: { color: QR_COLOR, type: 'dot' },
    backgroundOptions: { color: '#ffffff' },
    imageOptions: { crossOrigin: 'anonymous', margin: 4, imageSize: 0.32, hideBackgroundDots: true },
    qrOptions: { errorCorrectionLevel: 'H' },
};

const StyledQrCode: React.FC<{ value: string; size?: number }> = ({ value, size = 220 }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const qrRef = useRef<QRCodeStyling | null>(null);

    // Create the QR instance once and append it to the container.
    useEffect(() => {
        if (!containerRef.current) return;
        qrRef.current = new QRCodeStyling({ ...QR_OPTIONS, width: size, height: size, data: value });
        containerRef.current.replaceChildren();
        qrRef.current.append(containerRef.current);
    }, []);

    useEffect(() => {
        qrRef.current?.update({ data: value });
    }, [value]);

    return <div ref={containerRef} style={{ width: size, height: size }} />;
};

interface ReceiveModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type AddressFormat = 'uq' | 'eq' | 'raw';

const FORMATS: { id: AddressFormat; label: string }[] = [
    { id: 'uq', label: 'Non-bounceable' },
    { id: 'eq', label: 'Bounceable' },
    { id: 'raw', label: 'Raw' },
];

export const ReceiveModal: React.FC<ReceiveModalProps> = ({ isOpen, onClose }) => {
    const { address, getActiveWallet } = useWallet();
    const network = getActiveWallet()?.network ?? 'mainnet';
    const [format, setFormat] = useState<AddressFormat>('uq');

    const parsed = useMemo(() => {
        if (!address) return null;
        try {
            return Address.parse(address);
        } catch {
            return null;
        }
    }, [address]);

    const formattedAddress = useMemo(() => {
        if (!parsed) return address ?? '';
        if (format === 'raw') return parsed.toRawString();
        return parsed.toString({ urlSafe: true, bounceable: format === 'eq', testOnly: network === 'testnet' });
    }, [parsed, format, network, address]);

    const handleCopy = async () => {
        if (!formattedAddress) return;
        try {
            await navigator.clipboard.writeText(formattedAddress);
            toast.success('Address copied');
        } catch {
            toast.error('Failed to copy address');
        }
    };

    return (
        <Modal.Container isOpened={isOpen} onOpenChange={(open) => !open && onClose()} className="px-2">
            <Modal.Header onClose={onClose}>
                <Modal.Title>Receive</Modal.Title>
            </Modal.Header>

            <Modal.Body className="items-center gap-5">
                <div className="rounded-2xl border border-gray-100 p-4 bg-white">
                    {formattedAddress ? (
                        <StyledQrCode value={formattedAddress} />
                    ) : (
                        <div className="w-[220px] h-[220px] rounded-lg bg-gray-100 animate-pulse" />
                    )}
                </div>

                <div className="grid grid-cols-3 gap-1 w-full bg-[#F7F8FA] rounded-full p-1">
                    {FORMATS.map((f) => (
                        <button
                            key={f.id}
                            type="button"
                            onClick={() => setFormat(f.id)}
                            className={`py-1.5 rounded-full text-xs font-semibold transition-colors ${
                                format === f.id
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={handleCopy}
                    className="w-full flex items-center gap-2 bg-[#F7F8FA] rounded-2xl px-4 py-3 text-left hover:bg-gray-100 transition-colors"
                    aria-label="Copy address"
                >
                    <span className="flex-1 min-w-0 text-sm font-mono text-gray-700 break-all">{formattedAddress}</span>
                    <Copy className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </button>
            </Modal.Body>
        </Modal.Container>
    );
};
