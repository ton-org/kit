/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import type { SwapQuote } from '@ton/walletkit';

import { useSwapProviders } from '../../hooks/use-swap-providers';

import { cn } from '@/core/lib/utils';

function priceImpactColor(priceImpact: number): string {
    if (priceImpact > 500) return 'text-red-500';
    if (priceImpact > 200) return 'text-yellow-600';
    return 'text-green-600';
}

const InfoRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="flex items-center justify-between">
        <span className="text-gray-500">{label}</span>
        {children}
    </div>
);

interface SwapInfoProps {
    quote: SwapQuote;
    toSymbol: string;
    slippageBps: number;
}

/** Read-only summary of the current quote (provider, minimum received, price impact, slippage). */
export const SwapInfo: React.FC<SwapInfoProps> = ({ quote, toSymbol, slippageBps }) => {
    const providers = useSwapProviders();
    const providerName = providers.find((provider) => provider.id === quote.providerId)?.name ?? quote.providerId;

    return (
        <div className="space-y-2 rounded-2xl bg-gray-100 p-4 text-sm">
            <InfoRow label="Provider">
                <span className="font-medium capitalize text-gray-900">{providerName}</span>
            </InfoRow>
            <InfoRow label="Minimum received">
                <span className="font-medium text-gray-900">
                    {Number(quote.minReceived).toFixed(6)} {toSymbol}
                </span>
            </InfoRow>
            {quote.priceImpact ? (
                <InfoRow label="Price impact">
                    <span className={cn('font-medium', priceImpactColor(quote.priceImpact))}>
                        {(quote.priceImpact / 100).toFixed(2)}%
                    </span>
                </InfoRow>
            ) : null}
            <InfoRow label="Slippage">
                <span className="font-medium text-gray-900">{slippageBps / 100}%</span>
            </InfoRow>
        </div>
    );
};
