/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useMemo } from 'react';
import type { SignMessageRequestEvent, TransactionTraceMoneyFlowItem } from '@ton/walletkit';
import { AssetType } from '@ton/walletkit';
import type { SavedWallet } from '@demo/wallet-core';
import { useSignMessageRequests } from '@demo/wallet-core';

import { RequestModal } from './RequestModal';
import { TransactionRequestDetails } from './TransactionRequestDetails';

interface SignMessageRequestModalProps {
    request: SignMessageRequestEvent;
    savedWallets: SavedWallet[];
    isOpen: boolean;
}

export const SignMessageRequestModal: React.FC<SignMessageRequestModalProps> = ({ request, savedWallets, isOpen }) => {
    const { approveSignMessageRequest, rejectSignMessageRequest } = useSignMessageRequests();

    // Demo-only: present a clean money flow — no TON spent, just the NFT price
    // in USDT (the dApp covers the commission, so it is left out here).
    const demoMoneyFlow = useMemo<TransactionTraceMoneyFlowItem[]>(() => {
        const jettonItems = (request.request.items ?? []).filter((item) => item.type === 'jetton');
        const first = jettonItems[0];
        const flow: TransactionTraceMoneyFlowItem[] = [{ assetType: AssetType.ton, amount: '0' }];
        if (first) {
            flow.push({ assetType: AssetType.jetton, amount: (-100000000).toString(), tokenAddress: first.master });
        }
        return flow;
    }, [request.request]);

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
            title="Sign Message Request"
            subtitle="A dApp wants you to sign a transaction without broadcasting it"
            hideDApp
            details={
                <TransactionRequestDetails request={request.request} title="The dApp can submit:" purchaseSummary />
            }
            moneyFlow={demoMoneyFlow}
            approveLabel="Sign Message"
            successMessage="Message signed successfully"
            testIds={{
                request: 'request',
                approve: 'sign-message-approve',
                reject: 'sign-message-reject',
            }}
            onApprove={handleApprove}
            onReject={handleReject}
            loggerName="SignMessageRequestModal"
            previewMode="sign"
        />
    );
};
