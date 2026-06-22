/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import type { SendTransactionRequestEvent } from '@ton/walletkit';
import { useTransactionRequests } from '@demo/wallet-core';
import type { SavedWallet } from '@demo/wallet-core';

import { RequestModal } from '../request-modal';
import { TransactionRequestDetails } from '../transaction-request-details';

interface TransactionRequestModalProps {
    request: SendTransactionRequestEvent;
    savedWallets: SavedWallet[];
    isOpen: boolean;
}

export const TransactionRequestModal: React.FC<TransactionRequestModalProps> = ({ request, savedWallets, isOpen }) => {
    const { approveTransactionRequest, rejectTransactionRequest } = useTransactionRequests();

    const handleApprove = async () => {
        await approveTransactionRequest();
        // if (result?.signedBoc) {
        //     const { hash } = getNormalizedExtMessageHash(result.signedBoc);
        //     const { tonScan, tonViewer } = getTransactionExplorerUrls(hash, network);
        //     toast.success('Transaction is sent to the network', {
        //         description: (
        //             <span className="flex gap-3 mt-1">
        //                 <a href={tonScan} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
        //                     TonScan
        //                 </a>
        //                 <a
        //                     href={tonViewer}
        //                     target="_blank"
        //                     rel="noopener noreferrer"
        //                     className="text-blue-600 underline"
        //                 >
        //                     TonViewer
        //                 </a>
        //             </span>
        //         ),
        //     });
        // }
    };

    const handleReject = () => {
        rejectTransactionRequest('User rejected the transaction');
    };

    return (
        <RequestModal
            request={request}
            savedWallets={savedWallets}
            isOpen={isOpen}
            verb="Confirm transaction for"
            subtitle="A dApp wants to send a transaction from your wallet:"
            details={<TransactionRequestDetails request={request.request} />}
            approveLabel="Approve & Sign"
            disclaimer="Only approve transactions from dApps you trust. Blockchain transactions are irreversible."
            testIds={{ approve: 'send-transaction-approve', reject: 'send-transaction-reject' }}
            modalTestId="transaction-request"
            onApprove={handleApprove}
            onReject={handleReject}
            loggerName="TransactionRequestModal"
            previewMode="send"
        />
    );
};
