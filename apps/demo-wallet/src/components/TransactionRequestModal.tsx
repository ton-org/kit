/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState } from 'react';
import { useTransactionRequests } from '@demo/wallet-core';
import type { SavedWallet } from '@demo/wallet-core';
import { Drawer } from 'vaul';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ExternalLinkIcon } from 'lucide-react';

import { Button } from './Button';
import { createComponentLogger } from '../utils/logger';

interface TransactionRequestModalProps {
    wallet: SavedWallet | null | undefined;
    isOpen: boolean;
    showSuccess: boolean;
    onPurchased: () => void;
    onSuccessClose: () => void;
}

const log = createComponentLogger('TransactionRequestModal');

const NFT_NAME = 'Kissed Cat #0000';
const NFT_IMAGE = '/cat.png';

export const TransactionRequestModal: React.FC<TransactionRequestModalProps> = ({
    wallet,
    isOpen,
    showSuccess,
    onPurchased,
    onSuccessClose,
}) => {
    const { approveTransactionRequest, rejectTransactionRequest, pendingTransactionRequest } = useTransactionRequests();
    const [isBuying, setIsBuying] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [_savedRequest, setSavedRequest] = useState(pendingTransactionRequest);

    // Drawer close animation is ~300ms. Run any unmount-causing action AFTER the
    // animation so the slide-down isn't cut short by the parent unmounting us.
    const requestClose = (after: () => void) => {
        if (isClosing) return;
        setIsClosing(true);
        setTimeout(after, 300);
    };

    const handleBuy = async () => {
        setIsBuying(true);
        setSavedRequest(pendingTransactionRequest);
        try {
            await approveTransactionRequest();
            await new Promise((resolve) => setTimeout(resolve, 500));
            onPurchased();
        } catch (error) {
            log.error('Failed to approve transaction request:', error);
            toast.error('Failed to complete purchase', {
                description: (error as Error)?.message,
            });
        } finally {
            setIsBuying(false);
        }
    };

    const handleCancel = () => {
        requestClose(() => rejectTransactionRequest('User rejected the transaction'));
    };

    const handleDone = () => {
        requestClose(onSuccessClose);
    };

    const handleOpenChange = (open: boolean) => {
        if (open) return;
        if (showSuccess) {
            handleDone();
            return;
        }
        handleCancel();
    };

    return (
        <Drawer.Root open={isOpen && !isClosing} onOpenChange={handleOpenChange} dismissible={false}>
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/50 z-50" />
                <Drawer.Content
                    data-testid="request"
                    className="fixed bottom-0 left-0 right-0 z-50 mt-24 flex flex-col rounded-t-2xl bg-white outline-none"
                >
                    {showSuccess ? (
                        <>
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                                className="h-14 w-14 mx-auto mt-8 rounded-full bg-green-500 flex items-center justify-center"
                            >
                                <motion.svg
                                    className="h-7 w-7"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth={3}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <motion.path
                                        d="M5 12 L10 17 L19 7"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 0.35, delay: 0.2, ease: 'easeOut' }}
                                    />
                                </motion.svg>
                            </motion.div>
                            <Drawer.Title className="mt-4 text-center text-2xl font-semibold text-gray-900">
                                Sent Successfully
                            </Drawer.Title>

                            <p className="mt-1 text-xs mb-5 text-gray-500 text-center">
                                All done. You can close this window.
                            </p>

                            <div className="flex flex-col gap-3 px-4 pt-0 pb-6">
                                <div className="rounded-xl bg-gray-100 px-3 py-5">
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">
                                        Send
                                    </p>
                                    <p className="text-base font-semibold text-gray-900">100 TON</p>

                                    <div className="my-4 w-full h-px bg-gray-300" />

                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-2">
                                        Receive
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={NFT_IMAGE}
                                            alt={NFT_NAME}
                                            className="h-14 w-14 flex-shrink-0 rounded-lg object-cover"
                                        />
                                        <p className="text-base font-semibold text-gray-900">{NFT_NAME}</p>
                                    </div>

                                    <div className="my-4 w-full h-px bg-gray-300" />

                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">
                                        Fee
                                    </p>
                                    <p className="text-base font-semibold text-gray-900 flex items-center gap-1">
                                        0.1 TON
                                    </p>

                                    <div className="my-4 w-full h-px bg-gray-300" />

                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">
                                        Wallet
                                    </p>
                                    <p className="text-base font-semibold text-gray-900">
                                        Wallet 1 ({wallet?.address.slice(0, 4)}...{wallet?.address.slice(-4)})
                                    </p>
                                </div>

                                <div className="mt-2 flex w-full flex-col gap-2">
                                    <Button
                                        onClick={() => {
                                            window.open('http://localhost:5173/cat', '_blank');
                                        }}
                                        className="w-full"
                                    >
                                        Return to Marketplace
                                        <ExternalLinkIcon className="w-4 h-4 ml-2" />
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={handleDone}
                                        className="w-full"
                                        data-testid="send-transaction-approve"
                                    >
                                        Close
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <img
                                src="./market-logo.png"
                                alt="Market Logo"
                                className="h-14 w-14 mx-auto mt-8 rounded-lg object-cover"
                            />
                            <Drawer.Title className="mt-4 text-center text-2xl font-semibold text-gray-900">
                                Confirm Action
                            </Drawer.Title>

                            <p className="mt-1 text-xs mb-5 text-gray-500 text-center">
                                Confirm the purchase of {NFT_NAME} for 100 USDT.
                            </p>

                            <div className="flex flex-col gap-3 px-4 pt-0 pb-6">
                                <div className="rounded-xl bg-gray-100 px-3 py-5">
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">
                                        Send
                                    </p>
                                    <p className="text-base font-semibold text-gray-900">100 TON</p>

                                    <div className="my-4 w-full h-px bg-gray-300" />

                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-2">
                                        Receive
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={NFT_IMAGE}
                                            alt={NFT_NAME}
                                            className="h-14 w-14 flex-shrink-0 rounded-lg object-cover"
                                        />
                                        <p className="text-base font-semibold text-gray-900">{NFT_NAME}</p>
                                    </div>

                                    <div className="my-4 w-full h-px bg-gray-300" />

                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">
                                        Fee
                                    </p>
                                    <p className="text-base font-semibold text-gray-900 flex items-center gap-1">
                                        0.1 TON
                                    </p>

                                    <div className="my-4 w-full h-px bg-gray-300" />

                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">
                                        Wallet
                                    </p>
                                    <p className="text-base font-semibold text-gray-900">
                                        Wallet 1 ({wallet?.address.slice(0, 4)}...{wallet?.address.slice(-4)})
                                    </p>
                                </div>

                                <div className="mt-2 flex w-full flex-col gap-2">
                                    <Button
                                        onClick={handleBuy}
                                        isLoading={isBuying}
                                        disabled={isBuying}
                                        className="w-full"
                                        data-testid="send-transaction-approve"
                                    >
                                        Confirm
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={handleCancel}
                                        disabled={isBuying}
                                        className="w-full"
                                        data-testid="send-transaction-reject"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
};
