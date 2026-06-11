/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useState } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDownUp } from 'lucide-react';
import { useJettons, useSwap, useWallet } from '@demo/wallet-core';
import type { SwapToken } from '@ton/walletkit';

import { SwapField } from '../swap-field';
import { SwapInfo } from '../swap-info';
import { SwapSettings } from '../swap-settings';
import { QuoteTimer } from '../quote-timer';

import { Button } from '@/core/components/ui/button';
import { Input } from '@/core/components/ui/input';
import { getJettonsImage, getJettonsSymbol } from '@/features/jettons';
import { cn } from '@/core/lib/utils';
import { formatUnits } from '@/core/utils/units';

/** Reserved on a MAX TON swap, so the transaction still has gas to pay for itself. */
const TON_GAS_RESERVE = 0.1;

interface TokenView {
    symbol: string;
    icon?: string;
    balance: string;
}

interface SwapInterfaceProps {
    className?: string;
}

export const SwapInterface: FC<SwapInterfaceProps> = ({ className }) => {
    const navigate = useNavigate();
    const { balance } = useWallet();
    const { userJettons } = useJettons();
    const {
        fromToken,
        toToken,
        amount,
        isReverseSwap,
        destinationAddress,
        currentQuote,
        isLoadingQuote,
        isSwapping,
        error,
        slippageBps,
        providerId,
        setSwapAmount: setAmount,
        setIsReverseSwap,
        setDestinationAddress,
        setSlippageBps,
        setSwapProviderId,
        swapTokens,
        getSwapQuote,
        executeSwap,
    } = useSwap();

    const [useCustomDestination, setUseCustomDestination] = useState(false);

    const getTokenView = (token: SwapToken): TokenView => {
        if (token.address === 'ton') {
            return {
                symbol: token.symbol || 'GRAM',
                icon: '/gram.svg',
                balance: formatUnits(balance || '0', token.decimals),
            };
        }
        const jetton = userJettons.find((j) => j.address === token.address);
        return {
            symbol: token.symbol || (jetton ? getJettonsSymbol(jetton) : undefined) || 'Token',
            icon: token.image ?? (jetton ? getJettonsImage(jetton) : undefined),
            balance: jetton?.balance ? formatUnits(jetton.balance, token.decimals) : '0',
        };
    };

    const fromView = getTokenView(fromToken);
    const toView = getTokenView(toToken);

    const fromAmount = !isReverseSwap ? amount : currentQuote ? currentQuote.fromAmount : '';
    const toAmount = isReverseSwap ? amount : currentQuote ? currentQuote.toAmount : '';

    const handleFromAmountChange = (value: string) => {
        setAmount(value);
        setIsReverseSwap(false);
    };

    const handleToAmountChange = (value: string) => {
        setAmount(value);
        setIsReverseSwap(true);
    };

    const handleMaxFrom = () => {
        const currentBalance = parseFloat(fromView.balance);
        if (!(currentBalance > 0)) return;
        if (fromToken.address === 'ton') {
            const maxAmount = currentBalance - TON_GAS_RESERVE;
            if (maxAmount > 0) handleFromAmountChange(maxAmount.toString());
        } else {
            handleFromAmountChange(fromView.balance);
        }
    };

    const handleExecuteSwap = async () => {
        await executeSwap();
        navigate('/wallet', { state: { message: `${fromView.symbol} sent successfully!` } });
    };

    const getSwapButtonText = (): string => {
        const hasFromAmount = fromAmount && parseFloat(fromAmount) > 0;
        const hasToAmount = toAmount && parseFloat(toAmount) > 0;
        if (!hasFromAmount && !hasToAmount) return 'Enter amount';
        if (error) return 'Error';
        return `Swap ${fromView.symbol} for ${toView.symbol}`;
    };

    const isSwapDisabled = Boolean(error) || isLoadingQuote || isSwapping;

    return (
        <div className={cn('space-y-5', className)}>
            <div className="relative">
                <div className="space-y-1">
                    <SwapField
                        label="From"
                        symbol={fromView.symbol}
                        icon={fromView.icon}
                        amount={fromAmount}
                        balance={fromView.balance}
                        onAmountChange={handleFromAmountChange}
                        onMax={handleMaxFrom}
                    />
                    <SwapField
                        label="To"
                        symbol={toView.symbol}
                        icon={toView.icon}
                        amount={toAmount}
                        balance={toView.balance}
                        onAmountChange={handleToAmountChange}
                    />
                </div>

                <button
                    type="button"
                    onClick={swapTokens}
                    className="absolute left-1/2 top-1/2 z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white bg-blue-600 text-white shadow-md transition-colors hover:bg-blue-700"
                    aria-label="Swap direction"
                >
                    <ArrowDownUp className="h-4 w-4" />
                </button>
            </div>

            {/* Optional custom recipient */}
            <div className="space-y-2">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                    <input
                        type="checkbox"
                        checked={useCustomDestination}
                        onChange={(e) => {
                            setUseCustomDestination(e.target.checked);
                            if (!e.target.checked) setDestinationAddress('');
                        }}
                    />
                    <span>Send to a different address</span>
                </label>

                {useCustomDestination && (
                    <Input.Container>
                        <Input.Field>
                            <Input.Input
                                value={destinationAddress}
                                onChange={(e) => setDestinationAddress(e.target.value)}
                                placeholder="Recipient address (EQ…)"
                            />
                        </Input.Field>
                        <Input.Caption>Swapped tokens will be sent here instead of your wallet.</Input.Caption>
                    </Input.Container>
                )}
            </div>

            {currentQuote && (
                <>
                    <QuoteTimer expiresAt={currentQuote.expiresAt} onRefresh={getSwapQuote} loading={isLoadingQuote} />
                    <SwapInfo quote={currentQuote} toSymbol={toView.symbol} slippageBps={slippageBps} />
                </>
            )}

            {error && <p className="rounded-2xl bg-red-50 p-3 text-center text-sm text-red-500">{error}</p>}

            <div className="flex items-center gap-2">
                {!currentQuote ? (
                    <Button
                        type="button"
                        fullWidth
                        onClick={getSwapQuote}
                        loading={isLoadingQuote}
                        disabled={isSwapDisabled}
                    >
                        {isLoadingQuote ? 'Getting quote…' : 'Get Quote'}
                    </Button>
                ) : (
                    <Button
                        type="button"
                        fullWidth
                        onClick={handleExecuteSwap}
                        loading={isSwapping}
                        disabled={isSwapping}
                    >
                        {isSwapping ? 'Swapping…' : getSwapButtonText()}
                    </Button>
                )}
                <SwapSettings
                    slippageBps={slippageBps}
                    setSlippageBps={setSlippageBps}
                    providerId={providerId}
                    setProviderId={setSwapProviderId}
                />
            </div>
        </div>
    );
};
