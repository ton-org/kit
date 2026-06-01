/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState } from 'react';
import type { SavedWallet } from '@demo/wallet-core';
import { useSignMessageRequests } from '@demo/wallet-core';
import { Drawer } from 'vaul';
import { toast } from 'sonner';

import { Button } from './Button';
import { createComponentLogger } from '../utils/logger';

interface SignMessageRequestModalProps {
    wallet: SavedWallet | null | undefined;
    isOpen: boolean;
    showSuccess: boolean;
    onPurchased: () => void;
    onSuccessClose: () => void;
}

const log = createComponentLogger('SignMessageRequestModal');

const NFT_NAME = 'Kissed Frog #0000';
const NFT_IMAGE = '/frog.png';

function Section({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="rounded-xl bg-gray-100 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
            <div className="mt-1.5">{children}</div>
        </div>
    );
}

export const SignMessageRequestModal: React.FC<SignMessageRequestModalProps> = ({
    wallet,
    isOpen,
    showSuccess,
    onPurchased,
    onSuccessClose,
}) => {
    const { approveSignMessageRequest, rejectSignMessageRequest, pendingSignMessageRequest } = useSignMessageRequests();
    const [isBuying, setIsBuying] = useState(false);
    const [_savedRequest, setSavedRequest] = useState(pendingSignMessageRequest);

    const handleBuy = async () => {
        setIsBuying(true);
        setSavedRequest(pendingSignMessageRequest);
        try {
            await approveSignMessageRequest();
            onPurchased();
        } catch (error) {
            log.error('Failed to approve sign message request:', error);
            toast.error('Failed to complete purchase', {
                description: (error as Error)?.message,
            });
        } finally {
            setIsBuying(false);
        }
    };

    const handleCancel = () => {
        rejectSignMessageRequest('User rejected the sign message request');
    };

    const handleOpenChange = (open: boolean) => {
        if (open) return;
        if (showSuccess) {
            onSuccessClose();
            return;
        }
        handleCancel();
    };

    return (
        <Drawer.Root open={isOpen} onOpenChange={handleOpenChange} dismissible={false}>
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/50 z-50" />
                <Drawer.Content
                    data-testid="request"
                    className="fixed bottom-0 left-0 right-0 z-50 mt-24 flex flex-col rounded-t-2xl bg-white outline-none"
                >
                    {showSuccess ? (
                        <>
                            <img
                                src="./market-logo.png"
                                alt="Market Logo"
                                className="h-14 w-14 mx-auto mt-8 rounded-lg object-cover"
                            />
                            <Drawer.Title className="mt-4 mb-5 text-center text-2xl font-semibold text-gray-900">
                                Success!
                            </Drawer.Title>

                            <div className="flex flex-col gap-3 px-4 pt-0 pb-6">
                                <div className="rounded-xl bg-gray-100 px-3 py-5">
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">
                                        Sent
                                    </p>
                                    <p className="text-base font-semibold text-gray-900">100 USDT</p>

                                    <div className="my-4 w-full h-px bg-gray-300" />

                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-2">
                                        Received
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
                                        <s className="text-gray-500">0.1 TON</s>
                                        <span>0 TON</span>
                                        <span className="bg-blue-500/10 text-blue-500 text-xs rounded-lg px-1.5 py-0.75 ml-1">
                                            Gasless
                                        </span>
                                    </p>

                                    <div className="my-4 w-full h-px bg-gray-300" />

                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">
                                        Wallet
                                    </p>
                                    <p className="text-base font-semibold text-gray-900">
                                        Wallet 1 ({wallet?.address.slice(0, 6)}...{wallet?.address.slice(-4)})
                                    </p>
                                </div>

                                <Button onClick={onSuccessClose} className="w-full" data-testid="sign-message-approve">
                                    Done
                                </Button>
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
                                    <p className="text-base font-semibold text-gray-900">100 USDT</p>

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
                                        <s className="text-gray-500">0.1 TON</s>
                                        <span>0 TON</span>
                                        <span className="bg-blue-500/10 text-blue-500 text-xs rounded-lg px-1.5 py-0.75 ml-1">
                                            Gasless
                                        </span>
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
                                        data-testid="sign-message-approve"
                                    >
                                        Confirm
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={handleCancel}
                                        disabled={isBuying}
                                        className="w-full"
                                        data-testid="sign-message-reject"
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
