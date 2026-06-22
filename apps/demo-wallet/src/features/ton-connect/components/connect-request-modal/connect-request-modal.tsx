/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useEffect, useMemo, useState } from 'react';
import type { ConnectionRequestEvent, DAppInfo, Wallet } from '@ton/walletkit';
import type { SavedWallet } from '@demo/wallet-core';
import { toast } from 'sonner';
import { Check } from 'lucide-react';

import { DappRequestModal } from '../dapp-request-modal';
import { WalletPlate } from '../wallet-plate';

import { Button } from '@/core/components/ui/button';
import { createComponentLogger } from '@/core/lib/logger';
import { WalletPickerView } from '@/features/wallets';

const log = createComponentLogger('ConnectRequestModal');

// The demo always connects to the AppKit NFT Minter, but the request carries a
// generic TON Connect manifest (name/icon). Hardcode the dApp branding so the
// connect screen shows the minter regardless of what the manifest reports.
const DAPP_NAME = 'NFT Minter';
const DAPP_ICON_URL = '/market-logo.png';
const DAPP_INFO: DAppInfo = { name: DAPP_NAME, iconUrl: DAPP_ICON_URL };

// How long the "Connected" confirmation stays up before we hand the user back to the dApp.
const SUCCESS_DISPLAY_MS = 700;

interface ConnectRequestModalProps {
    /** Absent once the connection is approved — the modal stays mounted to show the success state. */
    request?: ConnectionRequestEvent;
    availableWallets: Wallet[];
    savedWallets: SavedWallet[];
    currentWallet?: Wallet;
    isOpen: boolean;
    onApprove: (selectedWallet: Wallet) => void;
    onReject: (reason?: string) => void;
    /** Fired after the "Connected" confirmation has been shown — return the user to the dApp. */
    onSuccessDone: () => void;
}

export const ConnectRequestModal: React.FC<ConnectRequestModalProps> = ({
    request,
    availableWallets,
    savedWallets,
    currentWallet,
    isOpen,
    onApprove,
    onReject,
    onSuccessDone,
}) => {
    const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(currentWallet ?? null);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Fall back to the active or first available wallet until one is picked.
    useEffect(() => {
        if (selectedWallet === null) setSelectedWallet(currentWallet ?? availableWallets[0] ?? null);
    }, [selectedWallet, currentWallet, availableWallets]);

    // Once the "Connected" confirmation is showing, hold it briefly, then hand the user back to the dApp.
    useEffect(() => {
        if (!showSuccess) return;
        const timer = setTimeout(onSuccessDone, SUCCESS_DISPLAY_MS);
        return () => clearTimeout(timer);
    }, [showSuccess, onSuccessDone]);

    // SavedWallet records keyed by the WalletKit id (savedWallet.id is a separate store id).
    const savedByKitId = useMemo(() => {
        const map = new Map<string, SavedWallet>();
        for (const w of savedWallets) {
            if (w.kitWalletId) map.set(w.kitWalletId, w);
        }
        return map;
    }, [savedWallets]);

    const walletName = (kitId: string): string => savedByKitId.get(kitId)?.name ?? 'Wallet';

    // Saved-wallet records for the connectable wallets, in availableWallets order.
    const pickerWallets = useMemo(
        () =>
            availableWallets.map((w) => savedByKitId.get(w.getWalletId())).filter((w): w is SavedWallet => Boolean(w)),
        [availableWallets, savedByKitId],
    );

    const permissions = request?.preview.permissions ?? [];
    const canSelect = availableWallets.length > 1;
    const selectedSavedId = selectedWallet ? savedByKitId.get(selectedWallet.getWalletId())?.id : undefined;

    const handleApprove = async () => {
        if (!selectedWallet) return;
        setIsLoading(true);
        try {
            await onApprove(selectedWallet);
            setShowSuccess(true);
        } catch (error) {
            log.error('Failed to approve connection:', error);
            toast.error('Failed to approve connection', { description: (error as Error)?.message });
        } finally {
            setIsLoading(false);
        }
    };

    // The picker reports a SavedWallet store id — resolve it to its loaded WalletKit wallet.
    const handlePick = (savedId: string) => {
        const kitId = savedWallets.find((w) => w.id === savedId)?.kitWalletId;
        const wallet = kitId ? availableWallets.find((w) => w.getWalletId() === kitId) : undefined;
        if (wallet) setSelectedWallet(wallet);
        setPickerOpen(false);
    };

    const walletSlot = (
        <WalletPlate
            name={selectedWallet ? walletName(selectedWallet.getWalletId()) : 'Wallet'}
            address={selectedWallet?.getAddress() ?? ''}
            selectable={canSelect}
            onClick={canSelect ? () => setPickerOpen(true) : undefined}
        />
    );

    return (
        <DappRequestModal
            isOpen={isOpen}
            testId="connect-request"
            dAppInfo={DAPP_INFO}
            verb="Connect to"
            subtitle={`${DAPP_NAME} is requesting access to your wallet address:`}
            walletSlot={walletSlot}
            altView={
                pickerOpen ? (
                    <WalletPickerView
                        onBack={() => setPickerOpen(false)}
                        wallets={pickerWallets}
                        selectedId={selectedSavedId}
                        onSelect={handlePick}
                    />
                ) : undefined
            }
            primary={
                showSuccess ? (
                    <Button
                        fullWidth
                        disabled
                        icon={<Check className="h-5 w-5" strokeWidth={3} />}
                        className="!bg-green-500 !text-white"
                        data-testid="connect-success"
                    >
                        Connected
                    </Button>
                ) : (
                    <Button
                        fullWidth
                        onClick={handleApprove}
                        loading={isLoading}
                        disabled={!selectedWallet || isLoading}
                        data-testid="connect-approve"
                    >
                        Connect wallet
                    </Button>
                )
            }
            onReject={() => onReject('User rejected the connection')}
            rejectDisabled={isLoading || showSuccess}
            rejectTestId="connect-reject"
            disclaimer="Only connect to trusted applications. This will give the dApp access to your wallet address and allow it to request transactions."
        >
            {permissions.length > 0 && (
                <div className="rounded-2xl bg-gray-100 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Requested permissions</p>
                    <div className="mt-3 space-y-3">
                        {permissions.map((permission, index) => (
                            <div key={index}>
                                <p className="font-bold text-gray-900">{permission.title}</p>
                                {permission.description && (
                                    <p className="text-sm text-gray-500">{permission.description}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </DappRequestModal>
    );
};
