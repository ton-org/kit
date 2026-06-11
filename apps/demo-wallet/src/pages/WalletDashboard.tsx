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

import {
    DashboardHeader,
    BalanceTotal,
    DashboardActions,
    DashboardAssets,
    ConnectRequestModal,
    TransactionRequestModal,
    SignDataRequestModal,
    SignMessageRequestModal,
} from '../components';

import { NewLayout } from '@/core/components/shared/new-layout';
import { NftsCard } from '@/features/nft';
import { usePasteHandler } from '@/core/hooks/use-paste-handler';

export const WalletDashboard: React.FC = () => {
    const { getAvailableWallets, savedWallets, getActiveWallet } = useWallet();
    const activeWallet = getActiveWallet();
    const {
        handleTonConnectUrl,
        pendingConnectRequest,
        isConnectModalOpen,
        approveConnectRequest,
        rejectConnectRequest,
    } = useTonConnect();
    const { pendingTransactionRequest, isTransactionModalOpen } = useTransactionRequests();
    const { pendingSignDataRequest, isSignDataModalOpen, approveSignDataRequest, rejectSignDataRequest } =
        useSignDataRequests();
    const { pendingSignMessageRequest, isSignMessageModalOpen } = useSignMessageRequests();

    // Keep clipboard paste-to-connect for TonConnect URLs
    usePasteHandler(handleTonConnectUrl);

    return (
        <NewLayout header={<DashboardHeader />}>
            <div className="space-y-4">
                <BalanceTotal />
                <DashboardActions />
                <DashboardAssets />
                <NftsCard />
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
