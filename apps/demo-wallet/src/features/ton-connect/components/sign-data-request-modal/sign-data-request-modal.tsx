/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useMemo, useState } from 'react';
import type { SignDataRequestEvent } from '@ton/walletkit';
import type { SavedWallet } from '@demo/wallet-core';
import { useAuth } from '@demo/wallet-core';
import { toast } from 'sonner';

import { DappRequestModal } from '../dapp-request-modal';
import { WalletPlate } from '../wallet-plate';

import { Button } from '@/core/components/ui/button';
import { HoldToSignButton } from '@/core/components/ui/hold-to-sign-button';
import { createComponentLogger } from '@/core/lib/logger';

const log = createComponentLogger('SignDataRequestModal');

interface SignDataRequestModalProps {
    request: SignDataRequestEvent;
    savedWallets: SavedWallet[];
    isOpen: boolean;
    onApprove: () => void;
    onReject: (reason?: string) => void;
}

const renderDataToSign = (data: SignDataRequestEvent['preview']['data']): React.ReactNode => {
    switch (data.type) {
        case 'text':
            return (
                <div className="rounded-2xl bg-gray-100 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Data to sign</p>
                    <p className="mt-2 font-semibold text-gray-900">Text Message</p>
                    <p className="break-words text-sm text-gray-500">{data.value.content}</p>
                </div>
            );
        case 'binary':
            return (
                <div className="rounded-2xl bg-gray-100 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Data to sign</p>
                    <p className="mt-2 font-semibold text-gray-900">Binary Data</p>
                    <p className="break-all text-sm text-gray-500">Content: {data.value.content}</p>
                </div>
            );
        case 'cell':
            return (
                <div className="space-y-3 rounded-2xl bg-gray-100 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Data to sign</p>
                    <div>
                        <p className="font-semibold text-gray-900">Content</p>
                        <p className="break-all text-sm text-gray-500">{data.value.content}</p>
                    </div>
                    {data.value.schema && (
                        <div>
                            <p className="font-semibold text-gray-900">Schema</p>
                            <p className="break-all text-sm text-gray-500">{data.value.schema}</p>
                        </div>
                    )}
                </div>
            );
        default:
            return <div className="rounded-2xl bg-gray-100 p-4 text-sm text-gray-500">Unknown data format</div>;
    }
};

export const SignDataRequestModal: React.FC<SignDataRequestModalProps> = ({
    request,
    savedWallets,
    isOpen,
    onApprove,
    onReject,
}) => {
    const { holdToSign } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const currentWallet = useMemo(
        () => savedWallets.find((wallet) => wallet.kitWalletId === request.walletId) ?? null,
        [savedWallets, request.walletId],
    );

    const dApp = request.dAppInfo ?? request.preview.dAppInfo;

    const handleApprove = async () => {
        setIsLoading(true);
        try {
            await onApprove();
            toast.success('Data signed');
        } catch (error) {
            log.error('Failed to sign data:', error);
            toast.error('Failed to sign data', { description: (error as Error)?.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DappRequestModal
            isOpen={isOpen}
            testId="sign-data-request"
            dAppInfo={dApp}
            domain={request.domain}
            verb="Sign data for"
            subtitle="dApp wants you to sign data with your wallet:"
            walletSlot={
                <WalletPlate
                    name={currentWallet?.name ?? 'Wallet'}
                    address={request.walletAddress ?? currentWallet?.address ?? ''}
                />
            }
            primary={
                holdToSign ? (
                    <HoldToSignButton
                        onComplete={handleApprove}
                        loading={isLoading}
                        disabled={isLoading}
                        holdDuration={3000}
                    />
                ) : (
                    <Button
                        fullWidth
                        onClick={handleApprove}
                        loading={isLoading}
                        disabled={isLoading}
                        data-testid="sign-data-approve"
                    >
                        Sign data
                    </Button>
                )
            }
            onReject={() => onReject('User rejected the sign data request')}
            rejectDisabled={isLoading}
            rejectTestId="sign-data-reject"
            disclaimer="Only sign data if you trust the requesting dApp and understand what you're signing. Signing data can have security implications."
        >
            {renderDataToSign(request.preview.data)}
        </DappRequestModal>
    );
};
