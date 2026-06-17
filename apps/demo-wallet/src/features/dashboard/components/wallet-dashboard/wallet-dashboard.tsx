/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import {
    useWallet,
    useTonConnect,
    useTransactionRequests,
    useSignDataRequests,
    useSignMessageRequests,
} from '@demo/wallet-core';

import { DashboardHeader } from '../dashboard-header';
import { BalanceTotal } from '../balance-total';
import { DashboardActions } from '../dashboard-actions';
import { DashboardAssets } from '../dashboard-assets';

import {
    ConnectRequestModal,
    TransactionRequestModal,
    SignDataRequestModal,
    SignMessageRequestModal,
} from '@/features/ton-connect';
import { NewLayout } from '@/core/components/shared/new-layout';
import { NftsCard } from '@/features/nft';
import { TransactionHistory } from '@/features/transactions';
import { useTonWallet } from '@/core/hooks';

export const WalletDashboard: React.FC = () => {
    // Re-initialize the wallet when the dashboard mounts (gated behind the unlocked route), so
    // WalletKit + currentWallet are restored when booting straight onto it — e.g. an extension
    // popup reopen. Must NOT move to AppRouter: useTonWallet inits once and at the root it fires
    // before the store rehydrates (isUnlocked=false), skipping loadAllWallets with no retry.
    useTonWallet();

    const { getAvailableWallets, savedWallets, getActiveWallet } = useWallet();
    const activeWallet = getActiveWallet();
    const { pendingConnectRequest, isConnectModalOpen, approveConnectRequest, rejectConnectRequest } = useTonConnect();
    const { pendingTransactionRequest, isTransactionModalOpen } = useTransactionRequests();
    const { pendingSignDataRequest, isSignDataModalOpen, approveSignDataRequest, rejectSignDataRequest } =
        useSignDataRequests();
    const { pendingSignMessageRequest, isSignMessageModalOpen } = useSignMessageRequests();

    return (
        <NewLayout header={<DashboardHeader />}>
            <div className="space-y-4">
                <BalanceTotal />
                <DashboardActions />
                <DashboardAssets />
                <NftsCard />
                <TransactionHistory />
            </div>

            {pendingConnectRequest && (
                <ConnectRequestModal
                    request={pendingConnectRequest}
                    availableWallets={getAvailableWallets()}
                    savedWallets={savedWallets}
                    currentWallet={getAvailableWallets().find((w) => w.getWalletId() === activeWallet?.kitWalletId)}
                    isOpen={isConnectModalOpen}
                    onApprove={approveConnectRequest}
                    onReject={rejectConnectRequest}
                />
            )}

            {pendingTransactionRequest && (
                <TransactionRequestModal
                    request={pendingTransactionRequest}
                    savedWallets={savedWallets}
                    isOpen={isTransactionModalOpen}
                />
            )}

            {pendingSignDataRequest && (
                <SignDataRequestModal
                    request={pendingSignDataRequest}
                    savedWallets={savedWallets}
                    isOpen={isSignDataModalOpen}
                    onApprove={approveSignDataRequest}
                    onReject={rejectSignDataRequest}
                />
            )}

            {pendingSignMessageRequest && (
                <SignMessageRequestModal
                    request={pendingSignMessageRequest}
                    savedWallets={savedWallets}
                    isOpen={isSignMessageModalOpen}
                />
            )}
        </NewLayout>
    );
};
