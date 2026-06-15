/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isValidAddress } from '@ton/walletkit';
import type { TONTransferRequest } from '@ton/walletkit';
import { useAuth, useJettons, useWallet, useWalletKit, getTransactionExplorerUrls } from '@demo/wallet-core';
import { toast } from 'sonner';

import { useSendToken } from '../../hooks/use-send-token';
import { useSendTokens } from '../../hooks/use-send-tokens';
import { TokenSelectButton } from '../token-select-button';
import { TokenSelectModal } from '../token-select-modal';
import { AmountField } from '../amount-field';
import { RecipientField } from '../recipient-field';
import { GaslessOptions } from '../gasless-options';
import type { TokenOption } from '../../types';

import { Button } from '@/core/components/ui/button';
import { NewLayout } from '@/core/components/shared/new-layout';
import { ScreenHeader } from '@/core/components/shared/screen-header';
import { createComponentLogger } from '@/core/lib/logger';

const log = createComponentLogger('SendTransaction');

export const SendTransaction: React.FC = () => {
    const navigate = useNavigate();
    const walletKit = useWalletKit();
    const { currentWallet, address, savedWallets, activeWalletId } = useWallet();
    const { showFastSend } = useAuth();
    const { loadUserJettons } = useJettons();
    const network = savedWallets.find((w) => w.id === activeWalletId)?.network ?? 'testnet';

    const [selectedId, setSelectedId] = useState('TON');
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showTokenModal, setShowTokenModal] = useState(false);

    const options = useSendTokens();
    const selected = options.find((option) => option.id === selectedId) ?? options[0];

    const sender = useSendToken({
        wallet: currentWallet,
        walletKit,
        tokenType: selected.token.type,
        jetton: selected.token.data,
        recipient,
        amount,
    });
    const gasless = sender.gasless;
    const effectiveGasless = gasless.effective;

    useEffect(() => {
        loadUserJettons();
    }, [loadUserJettons]);

    // Success toast with explorer links — for flows that return a broadcast hash
    // immediately (gasless send, fast send).
    const notifySent = (normalizedHash: string) => {
        const { tonScan, tonViewer } = getTransactionExplorerUrls(normalizedHash, network);
        toast.success('Transaction is sent to the network', {
            description: (
                <span className="flex gap-3 mt-1">
                    <a href={tonScan} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                        TonScan
                    </a>
                    <a href={tonViewer} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                        TonViewer
                    </a>
                </span>
            ),
        });
    };

    const handleSelectToken = (option: TokenOption) => {
        setSelectedId(option.id);
        setAmount('');
        setError('');
        setShowTokenModal(false);
    };

    const handleSendToSelf = () => {
        if (address) setRecipient(address);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (!isValidAddress(recipient)) {
                throw new Error('Invalid recipient address');
            }

            const inputAmount = parseFloat(amount);
            if (!(inputAmount > 0)) {
                throw new Error('Amount must be greater than 0');
            }
            if (inputAmount > selected.balance) {
                throw new Error('Insufficient balance');
            }

            // Build + submit, dispatching gasless vs regular inside the hook. Gasless
            // relays immediately and returns a hash → toast; the regular flow goes
            // through the preview queue.
            const result = await sender.send();
            if (result?.normalizedHash) {
                notifySent(result.normalizedHash);
                navigate('/wallet');
            } else {
                navigate('/wallet', { state: { message: `${selected.symbol} sent successfully!` } });
            }
        } catch (err) {
            log.error('Send transaction error:', err);
            setError(err instanceof Error ? err.message : 'Failed to send transaction');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFastSend = async () => {
        if (!currentWallet) return;
        const recipientAddress = recipient.trim() || address;
        if (!recipientAddress) return;
        if (!isValidAddress(recipientAddress)) {
            setError('Invalid recipient address');
            return;
        }
        setError('');
        setIsLoading(true);
        try {
            let result;
            if (selected.token.type === 'TON') {
                const params: TONTransferRequest = { recipientAddress, transferAmount: '1000000' };
                const tx = await currentWallet.createTransferTonTransaction(params);
                result = await currentWallet.sendTransaction(tx);
            } else if (selected.token.data) {
                const tx = await currentWallet.createTransferJettonTransaction({
                    recipientAddress,
                    jettonAddress: selected.token.data.address,
                    transferAmount: '1',
                });
                result = await currentWallet.sendTransaction(tx);
            }
            if (result?.normalizedHash) {
                notifySent(result.normalizedHash);
            }
        } catch (err) {
            log.error('Fast send error:', err);
            setError(err instanceof Error ? err.message : 'Failed to send');
        } finally {
            setIsLoading(false);
        }
    };

    const recipientError = recipient.length > 0 && !isValidAddress(recipient) ? 'Invalid address' : '';
    const isSendDisabled = sender.isDisabled || Boolean(recipientError);
    const isSendFastDisabled = !currentWallet || !address;

    return (
        <NewLayout header={<ScreenHeader title="Send" onBack={() => navigate('/wallet')} />}>
            {!currentWallet ? (
                <div className="py-10 text-center">
                    <p className="mb-3 text-sm text-gray-500">Loading wallet…</p>
                    <Button variant="secondary" size="sm" onClick={() => navigate('/wallet')}>
                        Back to dashboard
                    </Button>
                </div>
            ) : (
                <form onSubmit={handleSend} className="space-y-6">
                    <TokenSelectButton token={selected} onClick={() => setShowTokenModal(true)} />

                    <AmountField value={amount} onChange={setAmount} token={selected} />

                    <RecipientField
                        value={recipient}
                        onChange={setRecipient}
                        error={recipientError}
                        onUseMyAddress={address ? handleSendToSelf : undefined}
                    />

                    <GaslessOptions gasless={gasless} />

                    {error && <p className="text-center text-sm text-red-500">{error}</p>}

                    <div className="space-y-2">
                        <Button
                            type="submit"
                            fullWidth
                            loading={isLoading || gasless.isSending}
                            disabled={isSendDisabled}
                            data-testid="send-submit"
                        >
                            {effectiveGasless
                                ? gasless.isSending
                                    ? 'Sending…'
                                    : gasless.isQuoting
                                      ? 'Quoting…'
                                      : 'Send Gasless'
                                : isLoading
                                  ? 'Sending…'
                                  : `Send ${selected.symbol}`}
                        </Button>
                        {showFastSend && !effectiveGasless && (
                            <Button
                                type="button"
                                variant="secondary"
                                fullWidth
                                onClick={handleFastSend}
                                loading={isLoading}
                                disabled={isSendFastDisabled}
                                data-testid="send-fast"
                            >
                                Send Fast
                            </Button>
                        )}
                    </div>
                </form>
            )}

            <TokenSelectModal
                isOpened={showTokenModal}
                onOpenChange={setShowTokenModal}
                options={options}
                selectedId={selectedId}
                onSelect={handleSelectToken}
            />
        </NewLayout>
    );
};
