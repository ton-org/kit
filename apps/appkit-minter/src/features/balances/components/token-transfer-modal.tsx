/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useMemo, useState } from 'react';
import type { Jetton, UserFriendlyAddress } from '@ton/appkit';
import { getErrorMessage } from '@ton/appkit';
import { Button, Input, Modal, useAddress, useTransferJetton, useTransferTon } from '@ton/appkit-react';

import { GaslessControls } from './gasless-controls';
import { useGaslessTransfer } from '../hooks/use-gasless-transfer';
import { getTokenSummary } from '../utils/get-token-summary';
import { TokenSummary } from './token-summary';
import { TransferReceipt } from './transfer-receipt';

interface TokenTransferModalProps {
    tokenType: 'TON' | 'JETTON';
    jetton?: Jetton;
    tonBalance: string;
    isOpen: boolean;
    onClose: () => void;
}

export const TokenTransferModal: React.FC<TokenTransferModalProps> = ({
    tokenType,
    jetton,
    tonBalance,
    isOpen,
    onClose,
}) => {
    const [recipientAddress, setRecipientAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [comment, setComment] = useState('');
    const [transferError, setTransferError] = useState<string | null>(null);
    const [txBoc, setTxBoc] = useState<string | null>(null);
    const [gaslessEnabled, setGaslessEnabled] = useState(false);
    const [feeAsset, setFeeAsset] = useState<UserFriendlyAddress | null>(null);

    const address = useAddress();

    const tokenInfo = useMemo(() => getTokenSummary(tokenType, tonBalance, jetton), [tokenType, tonBalance, jetton]);

    const gasless = useGaslessTransfer({
        enabled: gaslessEnabled,
        jettonAddress: jetton?.address,
        recipientAddress,
        amount,
        comment,
        feeAsset,
    });

    const { mutateAsync: transferTon, isPending: isTransferTonPending } = useTransferTon();
    const { mutateAsync: transferJetton, isPending: isTransferJettonPending } = useTransferJetton();
    const isRegularPending = tokenType === 'TON' ? isTransferTonPending : isTransferJettonPending;
    const isPending = gaslessEnabled ? gasless.isSending : isRegularPending;

    const submitDisabled =
        isPending ||
        !recipientAddress ||
        !amount ||
        (tokenType === 'JETTON' && !jetton?.address) ||
        (gaslessEnabled && (!feeAsset || !gasless.quote || gasless.isQuoting));

    const submitText = gaslessEnabled
        ? gasless.isSending
            ? 'Sending…'
            : gasless.isQuoting
              ? 'Quoting…'
              : 'Send Gasless'
        : isPending
          ? 'Sending…'
          : `Send ${tokenInfo.symbol ?? 'Jetton'}`;

    const handleClose = () => {
        setRecipientAddress('');
        setAmount('');
        setComment('');
        setTransferError(null);
        setTxBoc(null);
        setGaslessEnabled(false);
        setFeeAsset(null);
        onClose();
    };

    const handleSubmit = async () => {
        setTransferError(null);
        try {
            if (gaslessEnabled) {
                const result = await gasless.send();
                if (result) setTxBoc(result.boc);
                return;
            }

            if (tokenType === 'TON') {
                const { boc } = await transferTon({ recipientAddress, amount, comment });
                setTxBoc(boc);
                return;
            }

            if (jetton?.address) {
                const { boc } = await transferJetton({
                    jettonAddress: jetton.address,
                    recipientAddress,
                    amount,
                    comment,
                    jettonDecimals: tokenInfo.decimals,
                });
                setTxBoc(boc);
                return;
            }

            throw new Error('Invalid token type or missing jetton address');
        } catch (error) {
            setTransferError(getErrorMessage(error));
        }
    };

    if (!tokenInfo.decimals) return null;

    return (
        <Modal title={`Transfer ${tokenInfo.name}`} open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <TokenSummary tokenType={tokenType} info={tokenInfo} />

            {txBoc ? (
                <TransferReceipt boc={txBoc} onClose={handleClose} />
            ) : (
                <>
                    <div className="space-y-4">
                        <Input size="s">
                            <Input.Header>
                                <Input.Title>Recipient Address</Input.Title>
                                {address && (
                                    <button
                                        type="button"
                                        onClick={() => setRecipientAddress(address)}
                                        className="text-xs text-primary hover:underline"
                                    >
                                        Use my address
                                    </button>
                                )}
                            </Input.Header>
                            <Input.Field>
                                <Input.Input
                                    type="text"
                                    value={recipientAddress}
                                    onChange={(e) => setRecipientAddress(e.target.value)}
                                    placeholder="Enter TON address"
                                />
                            </Input.Field>
                        </Input>

                        <Input size="s">
                            <Input.Header>
                                <Input.Title>Amount</Input.Title>
                            </Input.Header>
                            <Input.Field>
                                <Input.Input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    step="any"
                                    min="0"
                                />
                            </Input.Field>
                        </Input>

                        <Input size="s">
                            <Input.Header>
                                <Input.Title>Comment (optional)</Input.Title>
                            </Input.Header>
                            <Input.Field>
                                <Input.Input
                                    type="text"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Add a comment"
                                />
                            </Input.Field>
                        </Input>

                        {tokenType === 'JETTON' && (
                            <GaslessControls
                                enabled={gaslessEnabled}
                                onEnabledChange={setGaslessEnabled}
                                feeAsset={feeAsset}
                                onFeeAssetChange={setFeeAsset}
                                fee={gasless.fee}
                                quoteError={gasless.quoteError}
                            />
                        )}

                        {transferError && (
                            <div className="p-3 bg-error/10 border border-error/30 rounded-lg">
                                <p className="text-sm text-error">{transferError}</p>
                            </div>
                        )}
                    </div>

                    <div className="flex mt-6 gap-3">
                        <Button loading={isPending} onClick={handleSubmit} disabled={submitDisabled} className="flex-1">
                            {submitText}
                        </Button>
                        <Button variant="secondary" onClick={handleClose} className="flex-1">
                            Cancel
                        </Button>
                    </div>
                </>
            )}
        </Modal>
    );
};
