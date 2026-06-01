/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState, useMemo, useEffect } from 'react';
import type { ConnectionRequestEvent, Wallet } from '@ton/walletkit';
import { getNetworkType, getNetworkLabel } from '@demo/wallet-core';
import type { SavedWallet } from '@demo/wallet-core';
import { toast } from 'sonner';

import { Button } from './Button';
import { WalletPreview } from './WalletPreview';
import { createComponentLogger } from '../utils/logger';

// Create logger for connect request modal
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

    // Auto-select current wallet or first available wallet if selectedWallet is null
    useEffect(() => {
        if (selectedWallet !== null) return;

        const intervalId = setInterval(() => {
            const walletToSelect = currentWallet || availableWallets[0];
            if (walletToSelect) {
                setSelectedWallet(walletToSelect);
            }
        }, 100);

        return () => clearInterval(intervalId);
    }, [selectedWallet, availableWallets, currentWallet]);

    // Create a map of wallet IDs to SavedWallet data
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

    const formatAddress = (address: string, length: number = 16): string => {
        if (!address) return '';
        let halfLength = Math.floor(length / 2);
        if (halfLength > 24) {
            halfLength = 24;
        }
        let dots = '...';
        if (halfLength > 23) {
            dots = '';
        } else if (halfLength > 22) {
            dots = '.';
        }
        return `${address.slice(0, halfLength)}${dots}${address.slice(-halfLength)}`;
    };

    const getWalletNetworkInfo = (wallet?: Wallet): { label: string; isTestnet: boolean } => {
        if (!wallet) return { label: 'Unknown', isTestnet: false };
        const networkType = getNetworkType(wallet.getNetwork());
        return {
            label: getNetworkLabel(networkType),
            isTestnet: networkType !== 'mainnet',
        };
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center sm:p-4 z-50">
            <div className="bg-white w-full h-full sm:rounded-lg sm:max-w-md sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden">
                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="text-center">
                            <h2 data-testid="request" className="text-xl font-bold text-gray-900">
                                Connect Request
                            </h2>
                            <p className="text-gray-600 text-sm mt-1">A dApp wants to connect to your wallet</p>
                            {selectedWallet && (
                                <span
                                    className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        getWalletNetworkInfo(selectedWallet).isTestnet
                                            ? 'bg-orange-100 text-orange-800'
                                            : 'bg-green-100 text-green-800'
                                    }`}
                                >
                                    {getWalletNetworkInfo(selectedWallet).label}
                                </span>
                            )}
                        </div>

                        {/* dApp Information */}
                        <div className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center space-x-4">
                                <div
                                    className="w-12 h-12 rounded-lg text-white flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: '#0098EA' }}
                                >
                                    <svg viewBox="0 0 116 100" fill="currentColor" className="w-7 h-7">
                                        <path d="M28.8674 0L49.487 0L59.7968 17.8571L49.487 35.7142H28.8674L18.5576 17.8571L28.8674 0Z" />
                                        <path d="M86.6023 0L96.912 17.8571L86.6023 35.7142H65.9827L55.6729 17.8571L65.9827 0L86.6023 0Z" />
                                        <path d="M115.47 49.9998L105.16 67.8569H84.5403L74.2305 49.9998L84.5403 32.1427L105.16 32.1428L115.47 49.9998Z" />
                                        <path d="M86.6023 99.9997L65.9827 99.9997L55.6729 82.1426L65.9827 64.2855H86.6023L96.912 82.1426L86.6023 99.9997Z" />
                                        <path d="M28.8674 99.9997L18.5576 82.1426L28.8674 64.2855H49.487L59.7968 82.1426L49.487 99.9997H28.8674Z" />
                                        <path d="M0 49.9998L10.3098 32.1428H30.9294L41.2392 49.9998L30.9294 67.8569H10.3098L0 49.9998Z" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 truncate">NFT Marketplace</h3>
                                    <p className="text-xs text-gray-500 mt-1 truncate">nft.marketplace.ton.org</p>
                                </div>
                            </div>
                        </div>

                        {/* Requested Permissions */}
                        {(request.preview.permissions || []).length > 0 && (
                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Requested Permissions:</h4>
                                <div className="space-y-3">
                                    {request.preview.permissions?.map((permission, index) => (
                                        <div key={index} className="border rounded-lg p-3 bg-gray-50">
                                            <div className="flex items-start space-x-3">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                                <div className="flex-1 min-w-0">
                                                    <h5 className="text-sm font-medium text-gray-900 mb-1">
                                                        {permission.title}
                                                    </h5>
                                                    <p className="text-xs text-gray-600 leading-relaxed">
                                                        {permission.description}
                                                    </p>
                                                    {permission.name === 'ton_addr' && selectedWallet && (
                                                        <p className="text-xs text-gray-500 mt-1 truncate">
                                                            Your address:{' '}
                                                            {formatAddress(selectedWallet.getAddress(), 20)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Wallet Selection */}
                        {availableWallets.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-medium text-gray-900">
                                        {availableWallets.length > 1 ? 'Connecting with:' : 'Wallet:'}
                                    </h4>
                                    {availableWallets.length > 1 && !showAllWallets && (
                                        <button
                                            onClick={() => setShowAllWallets(true)}
                                            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                                        >
                                            Change wallet
                                        </button>
                                    )}
                                </div>

                                {showAllWallets ? (
                                    <div className="space-y-2">
                                        {availableWallets.map((wallet, index) => {
                                            const walletId = wallet.getWalletId();
                                            const savedWallet = walletDataMap.get(walletId);
                                            const networkLabel = getNetworkType(wallet.getNetwork());

                                            return (
                                                <label key={walletId} className="block cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="wallet"
                                                        value={walletId}
                                                        checked={selectedWallet?.getWalletId() === wallet.getWalletId()}
                                                        onChange={() => {
                                                            setSelectedWallet(wallet);
                                                            setShowAllWallets(false);
                                                        }}
                                                        className="sr-only"
                                                    />
                                                    <WalletPreview
                                                        wallet={
                                                            savedWallet || {
                                                                id: walletId,
                                                                name: `Wallet ${index + 1}`,
                                                                address: wallet.getAddress(),
                                                                publicKey: '',
                                                                walletType: 'mnemonic',
                                                                walletInterfaceType: 'mnemonic',
                                                                network: networkLabel,
                                                                createdAt: Date.now(),
                                                            }
                                                        }
                                                        isActive={
                                                            selectedWallet?.getWalletId() === wallet.getWalletId()
                                                        }
                                                        isCompact={false}
                                                        onClick={() => {
                                                            setSelectedWallet(wallet);
                                                            setShowAllWallets(false);
                                                        }}
                                                    />
                                                </label>
                                            );
                                        })}
                                        <button
                                            onClick={() => setShowAllWallets(false)}
                                            className="w-full text-sm text-gray-600 hover:text-gray-700 py-2 text-center"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    selectedWallet && (
                                        <div>
                                            <WalletPreview
                                                wallet={
                                                    walletDataMap.get(selectedWallet.getWalletId()) || {
                                                        id: selectedWallet.getWalletId(),
                                                        name: 'Selected Wallet',
                                                        address: selectedWallet.getAddress(),
                                                        publicKey: '',
                                                        walletType: 'mnemonic',
                                                        walletInterfaceType: 'mnemonic',
                                                        network: getNetworkType(selectedWallet.getNetwork()),
                                                        createdAt: Date.now(),
                                                    }
                                                }
                                                isActive={true}
                                                isCompact={true}
                                            />
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons — always visible at bottom */}
                <div className="flex space-x-3 p-4 border-t border-gray-200 bg-white">
                    <Button
                        data-testid="connect-reject"
                        variant="secondary"
                        onClick={handleReject}
                        disabled={isLoading}
                        className="flex-1"
                    >
                        Reject
                    </Button>
                    <Button
                        data-testid="connect-approve"
                        onClick={handleApprove}
                        isLoading={isLoading}
                        disabled={!selectedWallet || isLoading}
                        className="flex-1"
                    >
                        Connect
                    </Button>
                </div>
            </div>
        </div>
    );
};
