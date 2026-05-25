/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useState, useEffect, useMemo } from 'react';
import type { FC } from 'react';
import {
    useAddress,
    useGaslessSupportedAssets,
    useGaslessQuote,
    useJettonBalanceByAddress,
    useJettonWalletAddress,
    useSelectedWallet,
    useSendGaslessTransaction,
} from '@ton/appkit-react';
import { asBase64, compareAddress, createJettonTransferPayload, GaslessError, parseUnits } from '@ton/appkit';
import type { GaslessSupportedAsset, TransactionRequestMessage } from '@ton/appkit';
import { toast } from 'sonner';

import { Layout } from '@/core/components';

const USDT_MASTER_MAINNET = 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs';
const USDT_DECIMALS = 6;
const JETTON_FORWARD_TON = parseUnits('0.06', 9).toString();

const formatRelativeTimeFromNow = (timestampSec: number): string => {
    const diffSec = timestampSec - Math.floor(Date.now() / 1000);
    if (diffSec <= 0) return 'expired';
    const min = Math.floor(diffSec / 60);
    const sec = diffSec % 60;
    return min > 0 ? `${min}m ${sec}s` : `${sec}s`;
};

const useNow = (intervalMs = 1000): number => {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const id = window.setInterval(() => setNow(Date.now()), intervalMs);
        return () => window.clearInterval(id);
    }, [intervalMs]);

    return now;
};

export const GaslessPage: FC = () => {
    const address = useAddress();
    const [selectedWallet] = useSelectedWallet();

    const { data: supportedAssets, isLoading: isAssetsLoading } = useGaslessSupportedAssets();
    const { mutateAsync: sendGasless, isPending: isSending } = useSendGaslessTransaction();

    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('0.1');
    const [feeAsset, setFeeAsset] = useState<string | null>(null);

    useEffect(() => {
        if (address && !recipient) setRecipient(address);
    }, [address, recipient]);

    useEffect(() => {
        if (!feeAsset && supportedAssets?.length) {
            const preferred = supportedAssets.find((asset: GaslessSupportedAsset) =>
                compareAddress(asset.address, USDT_MASTER_MAINNET),
            );
            setFeeAsset(preferred?.address ?? supportedAssets[0].address);
        }
    }, [feeAsset, supportedAssets]);

    const { data: usdtBalance } = useJettonBalanceByAddress({
        jettonAddress: USDT_MASTER_MAINNET,
        ownerAddress: address,
        jettonDecimals: USDT_DECIMALS,
    });

    const { data: usdtWalletAddress } = useJettonWalletAddress({
        jettonAddress: USDT_MASTER_MAINNET,
        ownerAddress: address,
    });

    const supportsSignMessage = useMemo(() => {
        const features = selectedWallet?.getSupportedFeatures();
        if (features === undefined) return true;
        return features.some((f) => typeof f === 'object' && f.name === 'SignMessage');
    }, [selectedWallet]);

    const messages = useMemo<TransactionRequestMessage[] | null>(() => {
        if (!address || !usdtWalletAddress || !recipient || !amount) return null;
        try {
            const payload = createJettonTransferPayload({
                amount: parseUnits(amount, USDT_DECIMALS),
                destination: recipient,
                responseDestination: address,
            });
            return [
                {
                    address: usdtWalletAddress,
                    amount: JETTON_FORWARD_TON,
                    payload: asBase64(payload.toBoc().toString('base64')),
                },
            ];
        } catch {
            return null;
        }
    }, [address, amount, recipient, usdtWalletAddress]);

    const {
        data: quote,
        isFetching: isQuoting,
        error: quoteError,
    } = useGaslessQuote({
        feeAsset: feeAsset ?? undefined,
        messages: messages ?? undefined,
        query: { enabled: Boolean(address && feeAsset && messages) },
    });

    const now = useNow();
    const validUntilText = useMemo(() => {
        if (!quote) return null;
        // `now` is in the dep array so the countdown ticks every second.
        void now;
        return formatRelativeTimeFromNow(quote.validUntil);
    }, [quote, now]);

    const formattedFee = useMemo(() => {
        if (!quote) return null;
        const feeWhole = Number(quote.fee) / 10 ** USDT_DECIMALS;
        return feeWhole.toFixed(USDT_DECIMALS);
    }, [quote]);

    const handleSend = async () => {
        if (!quote) {
            toast.error('No quote available yet');
            return;
        }

        try {
            const result = await sendGasless({ quote });
            const txHash = result.normalizedHash;
            if (txHash) {
                const explorerUrl = `https://tonviewer.com/transaction/${txHash}`;
                toast.success('Gasless transaction submitted!', {
                    description: txHash.slice(0, 10) + '…',
                    action: {
                        label: 'Explorer',
                        onClick: () => window.open(explorerUrl, '_blank'),
                    },
                });
            } else {
                toast.success('Gasless transaction submitted!');
            }
        } catch (error) {
            if (error instanceof GaslessError) {
                toast.error(`${error.code}: ${error.message}`);
            } else {
                toast.error(error instanceof Error ? error.message : 'Failed to send gasless transaction');
            }
        }
    };

    return (
        <Layout title="Gasless Transfer">
            <div className="w-full max-w-[488px] mx-auto p-6 space-y-6 rounded-2xl border border-border bg-card">
                <div className="space-y-2">
                    <h2 className="text-xl font-semibold">Send USDT (Gasless)</h2>
                    <p className="text-sm text-muted-foreground">
                        Send USDT without having TON for gas. The fee is paid in the selected jetton.
                    </p>
                </div>

                {!address && (
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-600 text-sm">
                        Please connect your wallet first.
                    </div>
                )}

                {address && !supportsSignMessage && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-sm">
                        Your wallet does not support SignMessage, which is required for gasless transactions.
                    </div>
                )}

                {address && (
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-medium uppercase text-muted-foreground">USDT Balance</label>
                            <div className="text-lg font-mono">
                                {usdtBalance ? Number(usdtBalance).toFixed(2) : '0.00'} USDT
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Fee asset</label>
                            <select
                                className="w-full p-2 bg-secondary rounded-md border border-border"
                                value={feeAsset ?? ''}
                                onChange={(e) => setFeeAsset(e.target.value)}
                                disabled={isAssetsLoading || !supportedAssets?.length}
                            >
                                {supportedAssets?.map((asset) => (
                                    <option key={asset.address} value={asset.address}>
                                        {asset.address.slice(0, 6)}…{asset.address.slice(-4)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Recipient Address</label>
                            <input
                                className="w-full p-2 bg-secondary rounded-md border border-border"
                                value={recipient}
                                onChange={(e) => setRecipient(e.target.value)}
                                placeholder="Address"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Amount (USDT)</label>
                            <input
                                className="w-full p-2 bg-secondary rounded-md border border-border"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>

                        {quoteError && <div className="text-xs text-red-500">Quote failed: {quoteError.message}</div>}

                        {quote && (
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="text-muted-foreground">Relayer fee</div>
                                <div className="text-right font-mono">{formattedFee} USDT</div>
                                <div className="text-muted-foreground">Valid for</div>
                                <div className="text-right font-mono">{validUntilText}</div>
                            </div>
                        )}

                        <button
                            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold disabled:opacity-50"
                            onClick={handleSend}
                            disabled={isSending || isQuoting || !quote || !supportsSignMessage}
                        >
                            {isSending
                                ? 'Sending…'
                                : isQuoting
                                  ? 'Quoting…'
                                  : !supportsSignMessage
                                    ? 'SignMessage not supported'
                                    : 'Send Gasless'}
                        </button>
                    </div>
                )}
            </div>
        </Layout>
    );
};
