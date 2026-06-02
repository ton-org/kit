/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useMemo, useState } from 'react';
import {
    Button,
    Input,
    useAddress,
    useBalance,
    useJettons,
    formatLargeValue,
    parseUnits,
    TokenSelectModal,
    Skeleton,
} from '@ton/appkit-react';
import type { AppkitUIToken } from '@ton/appkit-react';
import { useSendCrossChainTransaction, useCrossChainProvider } from '@ton/appkit-react/cross-chain';
import { Network, validateNumericString, calcFiatValue, compareAddress } from '@ton/appkit';
import { toast } from 'sonner';
import { ChevronDown } from 'lucide-react';

import { TacTransactionProgress } from './tac-transaction-progress';
import { TacAddressInput, isTacAddressValid } from './tac-address-input';

const ASSETS: AppkitUIToken[] = [
    {
        symbol: 'TON',
        name: 'Toncoin',
        address: 'ton',
        decimals: 9,
        logo: 'https://asset.ston.fi/img/EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c/c8d21a3d93f9b574381e0a8d8f16d48b325dd8f54ce172f599c1e9d6c62f03f7',
        network: Network.mainnet(),
    },
    {
        symbol: 'USD₮',
        name: 'Tether USD',
        address: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
        decimals: 6,
        logo: 'https://asset.ston.fi/img/EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs/1a87edfee9a28b05578853952e5effb8cc30af1e0fb90043aa2ce19dce490849',
        network: Network.mainnet(),
        rate: '1',
    },
    {
        symbol: 'STON',
        name: 'STON',
        address: 'EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO',
        decimals: 9,
        logo: 'https://asset.ston.fi/img/EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO/7c9798ce1e64707fb4cb8f025d4060f66b386ed381b50498e3b88731cedeffe8',
        network: Network.mainnet(),
    },
];

export const BridgeToTacChain: React.FC = () => {
    const [targetWalletAddress, setTargetWalletAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [selectedAsset, setSelectedAsset] = useState(ASSETS[0]);
    const [isTokenSelectOpen, setIsTokenSelectOpen] = useState(false);
    const [trackingHash, setTrackingHash] = useState<string | null>(null);
    const [isSending, setIsSending] = useState(false);

    const address = useAddress();
    const { data: tonBalance, isLoading: isTonLoading, refetch: refetchBalance } = useBalance();
    const { data: userJettons, isLoading: isJettonsLoading, refetch: refetchJettons } = useJettons();

    const crossChainProvider = useCrossChainProvider({ id: 'tac' });
    const { send } = useSendCrossChainTransaction({ providerId: 'tac' });

    const isBalanceLoading = selectedAsset.address === 'ton' ? isTonLoading : isJettonsLoading;

    const currentBalance = useMemo(() => {
        if (selectedAsset.address === 'ton') {
            return tonBalance || '0';
        }
        const jetton = userJettons?.jettons?.find((j) => compareAddress(j.address, selectedAsset.address));
        return jetton?.balance || '0';
    }, [selectedAsset, tonBalance, userJettons]);

    const formattedBalance = useMemo(() => {
        return formatLargeValue(currentBalance, 4);
    }, [currentBalance]);

    const handleMax = () => {
        setAmount(currentBalance);
    };

    const handleAmountChange = (val: string) => {
        const normalized = val.replace(',', '.');
        if (normalized === '' || validateNumericString(normalized, selectedAsset.decimals)) {
            setAmount(normalized);
        }
    };

    const handleSend = async () => {
        if (!crossChainProvider) {
            toast.error('Cross-chain provider not initialized');
            return;
        }

        if (!address) {
            toast.error('Wallet not connected');
            return;
        }

        if (!targetWalletAddress) {
            toast.error('Please enter a target wallet address');
            return;
        }

        if (!isTacAddressValid(targetWalletAddress)) {
            toast.error('Invalid TAC Wallet address');
            return;
        }

        const amountNum = Number(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        setIsSending(true);
        try {
            const amountBigInt = parseUnits(amount, selectedAsset.decimals);

            const result = await send({
                senderAddress: address,
                message: {
                    evmTargetAddress: targetWalletAddress,
                },
                assets: [
                    {
                        address: selectedAsset.address === 'ton' ? undefined : selectedAsset.address,
                        rawAmount: amountBigInt,
                    },
                ],
            });

            if (result.normalizedHash) {
                setTrackingHash(result.normalizedHash);
                toast.success('Transaction submitted successfully!');
                refetchBalance();
                refetchJettons();
            }
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Failed to send transaction');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="mx-auto flex w-full max-w-[480px] flex-col gap-4">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <div className="relative flex flex-col gap-1">
                            <Input.Container className="flex-1">
                                <Input.Header>
                                    <Input.Title>Amount</Input.Title>
                                </Input.Header>
                                <Input.Field className="flex-col">
                                    <div className="w-full flex gap-2">
                                        <Input.Input
                                            type="text"
                                            name="bridge-to-tac-amount"
                                            inputMode="decimal"
                                            value={amount}
                                            onChange={(e) => handleAmountChange((e.target as HTMLInputElement).value)}
                                            placeholder="0.0"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setIsTokenSelectOpen(true)}
                                            className="flex items-center gap-2 rounded-full bg-tertiary px-3 py-1.5 hover:bg-tertiary/80 transition-colors"
                                        >
                                            <img src={selectedAsset.logo} className="size-5 rounded-full" alt="" />
                                            <span className="text-sm font-bold">{selectedAsset.symbol}</span>
                                            <ChevronDown size={14} className="opacity-50" />
                                        </button>
                                    </div>

                                    <div className="gap-2 flex flex-wrap w-full justify-between">
                                        <div className="text-xs text-tertiary-foreground px-1">
                                            {selectedAsset.rate && amount && (
                                                <>≈ ${formatLargeValue(calcFiatValue(amount, selectedAsset.rate), 2)}</>
                                            )}
                                        </div>
                                        <div className="flex gap-2 text-xs text-tertiary-foreground">
                                            <span className="flex items-center gap-1">
                                                Balance:{' '}
                                                {isBalanceLoading ? (
                                                    <Skeleton width={40} height={14} />
                                                ) : (
                                                    <>
                                                        {formattedBalance} {selectedAsset.symbol}
                                                    </>
                                                )}
                                            </span>
                                            <button
                                                onClick={handleMax}
                                                className="font-bold text-primary hover:underline"
                                            >
                                                MAX
                                            </button>
                                        </div>
                                    </div>
                                </Input.Field>
                            </Input.Container>
                        </div>
                    </div>

                    <TacAddressInput
                        name="bridge-to-tac-target-wallet-address"
                        value={targetWalletAddress}
                        onChange={setTargetWalletAddress}
                        className="flex-1"
                    />
                </div>

                <Button size="l" fullWidth onClick={handleSend} loading={isSending} className="mt-2">
                    Bridge to TAC
                </Button>
            </div>

            <TokenSelectModal
                open={isTokenSelectOpen}
                onClose={() => setIsTokenSelectOpen(false)}
                tokens={ASSETS}
                onSelect={setSelectedAsset}
                title="Select Token"
            />

            {trackingHash && (
                <TacTransactionProgress trackingHash={trackingHash} onDismiss={() => setTrackingHash(null)} />
            )}
        </div>
    );
};
