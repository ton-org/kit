/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import type { SignMessageRequestEvent } from '@ton/walletkit';
import type { SavedWallet } from '@demo/wallet-core';
import { useSignMessageRequests } from '@demo/wallet-core';

import { RequestModal } from '../request-modal';
import { TransactionRequestDetails } from '../transaction-request-details';

interface SignMessageRequestModalProps {
    request: SignMessageRequestEvent;
    savedWallets: SavedWallet[];
    isOpen: boolean;
}

export const SignMessageRequestModal: React.FC<SignMessageRequestModalProps> = ({ request, savedWallets, isOpen }) => {
    const { approveSignMessageRequest, rejectSignMessageRequest } = useSignMessageRequests();

    const handleApprove = async () => {
        await approveSignMessageRequest();
    };

    const handleReject = () => {
        rejectSignMessageRequest('User rejected the sign message request');
    };

    return (
        <RequestModal
            request={request}
            savedWallets={savedWallets}
            isOpen={isOpen}
            verb="Sign message for"
            subtitle="A dApp wants you to sign a transaction without broadcasting it:"
            details={<TransactionRequestDetails request={request.request} title="The dApp can submit" />}
            approveLabel="Sign message"
            disclaimer="Only sign if you trust the requesting dApp — it can submit this transaction later."
            testIds={{ approve: 'sign-message-approve', reject: 'sign-message-reject' }}
            modalTestId="sign-message-request"
            onApprove={handleApprove}
            onReject={handleReject}
            loggerName="SignMessageRequestModal"
            previewMode="sign"
        />
    );
};
