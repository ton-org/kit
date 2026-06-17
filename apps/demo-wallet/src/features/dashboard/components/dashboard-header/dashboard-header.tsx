/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTonConnect, useWallet } from '@demo/wallet-core';

import { WalletSelectorModal } from '@/features/wallets';
import { SettingsDropdown } from '@/features/settings';
import { ConnectDappModal } from '@/features/ton-connect';
import { ScanIcon } from '@/core/components/ui/icons';
import { usePasteHandler } from '@/core/hooks';

export const DashboardHeader: React.FC = () => {
    const [isWalletSelectorOpen, setIsWalletSelectorOpen] = useState(false);
    const [isConnectOpen, setIsConnectOpen] = useState(false);

    const { handleTonConnectUrl } = useTonConnect();
    const { savedWallets, activeWalletId } = useWallet();
    const activeWallet = savedWallets.find((w) => w.id === activeWalletId);

    usePasteHandler(handleTonConnectUrl, isConnectOpen);

    return (
        <header className="flex items-center justify-between px-4 py-3">
            <button
                type="button"
                onClick={() => setIsConnectOpen(true)}
                className="p-1.5 -ml-1.5 rounded-md hover:bg-gray-100 transition-colors"
                aria-label="Scan"
                data-testid="connect-dapp-button"
            >
                <ScanIcon className="w-5 h-5" />
            </button>

            <button
                type="button"
                onClick={() => setIsWalletSelectorOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors"
                aria-label="Select wallet"
            >
                <span className="text-sm font-semibold text-gray-900">{activeWallet?.name || 'No wallet'}</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            <SettingsDropdown />

            <WalletSelectorModal isOpen={isWalletSelectorOpen} onClose={() => setIsWalletSelectorOpen(false)} />
            <ConnectDappModal isOpen={isConnectOpen} onClose={() => setIsConnectOpen(false)} />
        </header>
    );
};
