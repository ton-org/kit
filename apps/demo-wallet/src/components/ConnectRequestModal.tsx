/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState, useMemo, useEffect } from 'react';
import type { ConnectionRequestEvent, Wallet } from '@ton/walletkit';
import { getNetworkType } from '@demo/wallet-core';
import type { SavedWallet } from '@demo/wallet-core';
import { Drawer } from 'vaul';
import { toast } from 'sonner';

import { Button } from './Button';
import { WalletPreview } from './WalletPreview';
import { createComponentLogger } from '../utils/logger';

const log = createComponentLogger('ConnectRequestModal');

interface ConnectRequestModalProps {
    request: ConnectionRequestEvent;
    availableWallets: Wallet[];
    savedWallets: SavedWallet[];
    currentWallet?: Wallet;
    isOpen: boolean;
    onApprove: (selectedWallet: Wallet) => void;
    onReject: (reason?: string) => void;
}

function shortAddress(address: string, head = 4, tail = 4): string {
    if (!address) return '';
    return `${address.slice(0, head)}...${address.slice(-tail)}`;
}

export const ConnectRequestModal: React.FC<ConnectRequestModalProps> = ({
    request,
    availableWallets,
    savedWallets,
    currentWallet,
    isOpen,
    onApprove,
    onReject,
}) => {
    const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(currentWallet || null);
    const [isLoading, setIsLoading] = useState(false);
    const [showAllWallets, setShowAllWallets] = useState(false);

    useEffect(() => {
        if (selectedWallet !== null) return;
        const intervalId = setInterval(() => {
            const walletToSelect = currentWallet || availableWallets[0];
            if (walletToSelect) setSelectedWallet(walletToSelect);
        }, 100);
        return () => clearInterval(intervalId);
    }, [selectedWallet, availableWallets, currentWallet]);

    const walletDataMap = useMemo(() => {
        const map = new Map<string, SavedWallet>();
        savedWallets.forEach((savedWallet) => {
            map.set(savedWallet.id, savedWallet);
        });
        return map;
    }, [savedWallets]);

    const handleApprove = async () => {
        if (!selectedWallet) return;
        setIsLoading(true);
        try {
            await onApprove(selectedWallet);
        } catch (error) {
            log.error('Failed to approve connection:', error);
            toast.error('Failed to approve connection', {
                description: (error as Error)?.message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleReject = () => {
        onReject('User rejected the connection');
    };

    const handleOpenChange = (open: boolean) => {
        if (open || isLoading) return;
        handleReject();
    };

    const selectedSavedWallet = selectedWallet ? walletDataMap.get(selectedWallet.getWalletId()) : null;

    const dAppIcon = './market-logo.png';
    const dAppName = 'NFT Marketplace';
    let dAppHost: string = 'nft.marketplace.ton.org';

    const permissions = request.preview.permissions || [];

    return (
        <Drawer.Root open={isOpen} onOpenChange={handleOpenChange} dismissible={false}>
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/50 z-50" />
                <Drawer.Content
                    data-testid="request"
                    className="fixed bottom-0 left-0 right-0 z-50 mt-24 flex flex-col rounded-t-2xl bg-white outline-none"
                >
                    {showAllWallets ? (
                        <>
                            <Drawer.Title className="mt-6 mb-4 text-center text-2xl font-semibold text-gray-900">
                                Choose wallet
                            </Drawer.Title>

                            <div className="flex flex-col gap-3 px-4 pt-0 pb-6">
                                <div className="space-y-2">
                                    {availableWallets.map((wallet, index) => {
                                        const walletId = wallet.getWalletId();
                                        const savedWallet = walletDataMap.get(walletId);
                                        const fallbackNetwork = getNetworkType(wallet.getNetwork());

                                        return (
                                            <WalletPreview
                                                key={walletId}
                                                wallet={
                                                    savedWallet || {
                                                        id: walletId,
                                                        name: `Wallet ${index + 1}`,
                                                        address: wallet.getAddress(),
                                                        publicKey: '',
                                                        walletType: 'mnemonic',
                                                        walletInterfaceType: 'mnemonic',
                                                        network: fallbackNetwork,
                                                        createdAt: Date.now(),
                                                    }
                                                }
                                                isActive={selectedWallet?.getWalletId() === walletId}
                                                isCompact={false}
                                                onClick={() => {
                                                    setSelectedWallet(wallet);
                                                    setShowAllWallets(false);
                                                }}
                                            />
                                        );
                                    })}
                                </div>

                                <Button variant="secondary" onClick={() => setShowAllWallets(false)} className="w-full">
                                    Back
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            {dAppIcon ? (
                                <img
                                    src={dAppIcon}
                                    alt={dAppName}
                                    className="h-14 w-14 mx-auto mt-8 rounded-lg object-cover"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            ) : (
                                <div className="h-14 w-14 mx-auto mt-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <svg className="h-7 w-7 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                            )}

                            <Drawer.Title className="mt-4 text-center text-2xl font-semibold text-gray-900">
                                Connect Request
                            </Drawer.Title>

                            <p className="mt-1 text-xs mb-5 text-gray-500 text-center">
                                A dApp wants to connect to your wallet.
                            </p>

                            <div className="flex flex-col gap-3 px-4 pt-0 pb-6">
                                <div className="rounded-xl bg-gray-100 px-3 py-5">
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">
                                        dApp
                                    </p>
                                    <p className="text-base font-semibold text-gray-900">{dAppName}</p>
                                    {dAppHost && <p className="mt-0.5 text-xs text-gray-500">{dAppHost}</p>}

                                    {permissions.length > 0 && (
                                        <>
                                            <div className="my-4 w-full h-px bg-gray-300" />
                                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-2">
                                                Permissions
                                            </p>
                                            <ul className="space-y-1.5">
                                                {permissions.map((permission, index) => (
                                                    <li key={index} className="flex items-center gap-2">
                                                        <span className="mt-0.25 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                                                        <span className="text-sm font-semibold text-gray-900">
                                                            {permission.title}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </>
                                    )}

                                    {selectedWallet && (
                                        <>
                                            <div className="my-4 w-full h-px bg-gray-300" />
                                            <div className="flex items-center justify-between">
                                                <div className="min-w-0">
                                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">
                                                        Wallet
                                                    </p>
                                                    <p className="text-base font-semibold text-gray-900">
                                                        {selectedSavedWallet?.name ?? 'Wallet'} (
                                                        {shortAddress(selectedWallet.getAddress())})
                                                    </p>
                                                </div>
                                                {availableWallets.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowAllWallets(true)}
                                                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                                                    >
                                                        Change
                                                    </button>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="mt-2 flex w-full flex-col gap-2">
                                    <Button
                                        onClick={handleApprove}
                                        isLoading={isLoading}
                                        disabled={!selectedWallet || isLoading}
                                        className="w-full"
                                        data-testid="connect-approve"
                                    >
                                        Connect
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={handleReject}
                                        disabled={isLoading}
                                        className="w-full"
                                        data-testid="connect-reject"
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
