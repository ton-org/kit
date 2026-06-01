/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useEffect, useMemo, useState } from 'react';
import type { SendTransactionRequestEvent, SignMessageRequestEvent } from '@ton/walletkit';
import { useAuth } from '@demo/wallet-core';
import type { SavedWallet } from '@demo/wallet-core';
import { toast } from 'sonner';

import { Button } from './Button';
import { HoldToSignButton } from './HoldToSignButton';
import { SuccessCard } from './SuccessCard';
import { TON_INFO } from '../hooks/useJettonInfo';
import { createComponentLogger } from '../utils/logger';

type RequestEvent = SendTransactionRequestEvent | SignMessageRequestEvent;
type WarningTone = 'red' | 'yellow';

interface RequestModalProps {
    request: RequestEvent;
    savedWallets: SavedWallet[];
    isOpen: boolean;
    title: string;
    subtitle: string;
    details?: React.ReactNode;
    warning: { tone: WarningTone; message: React.ReactNode };
    approveLabel: string;
    successMessage: string;
    testIds: { request: string; approve: string; reject: string };
    onApprove: () => Promise<void>;
    onReject: () => void;
    loggerName: string;
    previewMode: 'send' | 'sign';
}

export const RequestModal: React.FC<RequestModalProps> = ({
    request,
    savedWallets,
    isOpen,
    title,
    subtitle,
    details,
    approveLabel,
    successMessage,
    testIds,
    onApprove,
    onReject,
    loggerName,
    previewMode,
}) => {
    const { holdToSign } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isExpired, setIsExpired] = useState(false);

    const log = useMemo(() => createComponentLogger(loggerName), [loggerName]);

    const currentWallet = useMemo(() => {
        if (!request.walletAddress) return null;
        return savedWallets.find((wallet) => wallet.kitWalletId === request.walletId) || null;
    }, [savedWallets, request.walletAddress, request.walletId]);

    useEffect(() => {
        const checkExpiration = () => {
            const validUntil = request.request?.validUntil;
            if (validUntil) {
                const now = Math.floor(Date.now() / 1000);
                setIsExpired(validUntil < now);
            } else {
                setIsExpired(false);
            }
        };
        checkExpiration();
        const interval = setInterval(checkExpiration, 1000);
        return () => clearInterval(interval);
    }, [request.request?.validUntil]);

    useEffect(() => {
        if (!isOpen) {
            setShowSuccess(false);
            setIsLoading(false);
            setIsExpired(false);
        }
    }, [isOpen]);

    const handleApprove = async () => {
        setIsLoading(true);
        try {
            await onApprove();
            setShowSuccess(true);
        } catch (error) {
            log.error(`Failed to approve ${loggerName}:`, error);
            toast.error('Failed to approve request', {
                description: (error as Error)?.message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;
    if (showSuccess) return <SuccessCard message={successMessage} />;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center sm:p-4 z-50">
            <div className="bg-white w-full h-full sm:rounded-lg sm:max-w-md sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden">
                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 data-testid={testIds.request} className="text-xl font-bold text-gray-900">
                                {title}
                            </h2>
                            <p className="text-gray-600 text-sm mt-1">{subtitle}</p>
                        </div>

                        {/* Combined dApp + Wallet block */}
                        <div className="border rounded-lg bg-gray-50 overflow-hidden">
                            {/* dApp row */}
                            <div className="flex items-center space-x-3 p-4">
                                <div
                                    className="w-10 h-10 rounded-lg text-white flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: '#0098EA' }}
                                >
                                    <svg viewBox="0 0 116 100" fill="currentColor" className="w-6 h-6">
                                        <path d="M28.8674 0L49.487 0L59.7968 17.8571L49.487 35.7142H28.8674L18.5576 17.8571L28.8674 0Z" />
                                        <path d="M86.6023 0L96.912 17.8571L86.6023 35.7142H65.9827L55.6729 17.8571L65.9827 0L86.6023 0Z" />
                                        <path d="M115.47 49.9998L105.16 67.8569H84.5403L74.2305 49.9998L84.5403 32.1427L105.16 32.1428L115.47 49.9998Z" />
                                        <path d="M86.6023 99.9997L65.9827 99.9997L55.6729 82.1426L65.9827 64.2855H86.6023L96.912 82.1426L86.6023 99.9997Z" />
                                        <path d="M28.8674 99.9997L18.5576 82.1426L28.8674 64.2855H49.487L59.7968 82.1426L49.487 99.9997H28.8674Z" />
                                        <path d="M0 49.9998L10.3098 32.1428H30.9294L41.2392 49.9998L30.9294 67.8569H10.3098L0 49.9998Z" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">NFT Marketplace</p>
                                    <p className="text-xs text-gray-500 truncate">nft.marketplace.ton.org</p>
                                </div>
                            </div>

                            {/* Wallet row */}
                            {currentWallet && (
                                <>
                                    <div className="border-t border-gray-200" />
                                    <div className="flex items-center space-x-3 p-4">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center flex-shrink-0">
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                                />
                                            </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {currentWallet.name}
                                            </p>
                                            <p className="text-xs text-gray-500 font-mono truncate">
                                                {currentWallet.address.slice(0, 6)}...{currentWallet.address.slice(-6)}
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {isExpired ? (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg
                                            className="h-6 w-6 text-orange-500"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-orange-800">Transaction Expired</h3>
                                        <p className="text-sm text-orange-700 mt-1">
                                            This transaction request has expired and can no longer be signed. Please
                                            reject it and request a new transaction from the dApp.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {details}

                                {previewMode === 'send' && (
                                    <div>
                                        <div className="font-semibold mb-1">Money Flow:</div>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center justify-between">
                                                <span className="truncate max-w-[200px] flex items-center gap-2">
                                                    <img
                                                        src={TON_INFO.image}
                                                        alt={TON_INFO.name}
                                                        className="w-8 h-8 rounded-full"
                                                    />
                                                    <div>TON</div>
                                                </span>
                                                <div className="flex ml-2 font-medium text-red-600">-100.005 TON</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Action buttons — always visible at bottom */}
                <div className="flex space-x-3 p-4 border-t border-gray-200 bg-white">
                    <Button
                        variant="secondary"
                        onClick={onReject}
                        disabled={isLoading}
                        className={isExpired ? 'w-full' : 'flex-1'}
                        data-testid={testIds.reject}
                    >
                        Reject
                    </Button>
                    {!isExpired &&
                        (holdToSign ? (
                            <HoldToSignButton
                                onComplete={handleApprove}
                                isLoading={isLoading}
                                disabled={isLoading}
                                holdDuration={3000}
                            />
                        ) : (
                            <Button
                                onClick={handleApprove}
                                isLoading={isLoading}
                                disabled={isLoading}
                                className="flex-1"
                                data-testid={testIds.approve}
                            >
                                {approveLabel}
                            </Button>
                        ))}
                </div>
            </div>
        </div>
    );
};
