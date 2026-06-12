/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useEffect, useMemo, useState } from 'react';
import type { SendTransactionRequestEvent, SignMessageRequestEvent, TransactionEmulatedPreview } from '@ton/walletkit';
import { useAuth, useWalletKit, useWalletStore } from '@demo/wallet-core';
import type { SavedWallet } from '@demo/wallet-core';
import { toast } from 'sonner';

import { DappRequestModal } from '../dapp-request-modal';
import { WalletPlate } from '../wallet-plate';

import { Button } from '@/core/components/ui/button';
import { HoldToSignButton } from '@/core/components/ui/hold-to-sign-button';
import { JettonFlow } from '@/features/jettons';
import { createComponentLogger } from '@/core/lib/logger';

type RequestEvent = SendTransactionRequestEvent | SignMessageRequestEvent;

interface RequestModalProps {
    request: RequestEvent;
    savedWallets: SavedWallet[];
    isOpen: boolean;
    verb: string;
    subtitle: string;
    details?: React.ReactNode;
    approveLabel: string;
    disclaimer: React.ReactNode;
    testIds: { approve: string; reject: string };
    /** Distinguishes the request type for tests (e.g. "transaction-request"). */
    modalTestId: string;
    onApprove: () => Promise<void>;
    onReject: () => void;
    loggerName: string;
    previewMode: 'send' | 'sign';
}

/** Shared shell for transaction / sign-message requests, built on {@link DappRequestModal}. */
export const RequestModal: React.FC<RequestModalProps> = ({
    request,
    savedWallets,
    isOpen,
    verb,
    subtitle,
    details,
    approveLabel,
    disclaimer,
    testIds,
    modalTestId,
    onApprove,
    onReject,
    loggerName,
    previewMode,
}) => {
    const walletKit = useWalletKit();
    const isAuthenticated = useWalletStore((state) => state.walletManagement.isAuthenticated);
    const { holdToSign } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isExpired, setIsExpired] = useState(false);
    const [localPreview, setLocalPreview] = useState<TransactionEmulatedPreview | undefined>(undefined);

    const log = useMemo(() => createComponentLogger(loggerName), [loggerName]);

    const currentWallet = useMemo(
        () => (request.walletAddress ? (savedWallets.find((w) => w.kitWalletId === request.walletId) ?? null) : null),
        [savedWallets, request.walletAddress, request.walletId],
    );

    useEffect(() => {
        const check = () => {
            const validUntil = request.request?.validUntil;
            setIsExpired(validUntil ? validUntil < Math.floor(Date.now() / 1000) : false);
        };
        check();
        const interval = setInterval(check, 1000);
        return () => clearInterval(interval);
    }, [request.request?.validUntil]);

    useEffect(() => {
        if (!isAuthenticated) return;
        async function updatePreview() {
            if (request.preview.data) return;
            await walletKit?.ensureInitialized();
            const preview = await walletKit
                ?.getWallet(request.walletId ?? '')
                ?.getTransactionPreview(request.request, { mode: previewMode });
            setLocalPreview(preview);
        }
        updatePreview();
    }, [request.walletId, request.request, request.preview, walletKit, isAuthenticated, previewMode]);

    const preview = useMemo(() => localPreview ?? request.preview.data, [request, localPreview]);

    useEffect(() => {
        if (!isOpen) {
            setIsLoading(false);
            setIsExpired(false);
        }
    }, [isOpen]);

    const handleApprove = async () => {
        setIsLoading(true);
        try {
            await onApprove();
        } catch (error) {
            log.error(`Failed to approve ${loggerName}:`, error);
            toast.error('Failed to approve request', { description: (error as Error)?.message });
        } finally {
            setIsLoading(false);
        }
    };

    const hasNoTransfers =
        preview?.moneyFlow?.outputs === '0' &&
        preview?.moneyFlow?.inputs === '0' &&
        preview?.moneyFlow?.ourTransfers.length === 0;

    const primary = isExpired ? (
        <Button fullWidth disabled data-testid={testIds.approve}>
            Expired
        </Button>
    ) : holdToSign ? (
        <HoldToSignButton onComplete={handleApprove} loading={isLoading} disabled={isLoading} holdDuration={3000} />
    ) : (
        <Button
            fullWidth
            onClick={handleApprove}
            loading={isLoading}
            disabled={isLoading}
            data-testid={testIds.approve}
        >
            {approveLabel}
        </Button>
    );

    return (
        <DappRequestModal
            isOpen={isOpen}
            testId={modalTestId}
            dAppInfo={request.dAppInfo}
            domain={request.domain}
            verb={verb}
            subtitle={subtitle}
            walletSlot={
                currentWallet ? (
                    <WalletPlate name={currentWallet.name} address={request.walletAddress ?? currentWallet.address} />
                ) : null
            }
            primary={primary}
            onReject={onReject}
            rejectDisabled={isLoading}
            rejectTestId={testIds.reject}
            disclaimer={disclaimer}
        >
            {isExpired ? (
                <div className="rounded-2xl bg-orange-50 p-4 text-sm text-orange-800">
                    This request has expired and can no longer be signed. Reject it and request a new one from the dApp.
                </div>
            ) : (
                <>
                    {details}
                    {preview?.result === 'success' && !hasNoTransfers && (
                        <JettonFlow transfers={preview.moneyFlow?.ourTransfers ?? []} />
                    )}
                    {preview && (preview.result === 'failure' || preview.error) && (
                        <div className="rounded-2xl bg-red-50 p-3 text-sm text-red-800">
                            <strong>Error:</strong> {preview.error?.message}
                        </div>
                    )}
                </>
            )}
        </DappRequestModal>
    );
};
