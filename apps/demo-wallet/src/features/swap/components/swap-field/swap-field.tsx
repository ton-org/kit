/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';

import { FallbackImage } from '@/core/components/ui/fallback-image';
import { formatLargeValue } from '@/core/utils';

interface SwapFieldProps {
    label: string;
    symbol: string;
    icon?: string;
    amount: string;
    /** Held balance as a human-readable decimal string. */
    balance: string;
    onAmountChange: (value: string) => void;
    onMax?: () => void;
}

/** One side of the swap (From / To): amount on the left, a token pill on the right. */
export const SwapField: React.FC<SwapFieldProps> = ({
    label,
    symbol,
    icon,
    amount,
    balance,
    onAmountChange,
    onMax,
}) => (
    <div className="space-y-2 rounded-2xl bg-gray-100 p-4">
        <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">{label}</span>
            <span className="flex items-center gap-2 text-xs text-gray-500">
                <span className="tabular-nums">Balance: {formatLargeValue(balance, 4)}</span>
                {onMax && parseFloat(balance) > 0 && (
                    <button type="button" onClick={onMax} className="font-semibold text-blue-600 hover:text-blue-700">
                        Max
                    </button>
                )}
            </span>
        </div>

        <div className="flex items-center gap-3">
            <input
                className="min-w-0 flex-1 border-0 bg-transparent p-0 text-3xl font-semibold text-gray-900 outline-none placeholder:text-gray-300 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                inputMode="decimal"
                placeholder="0"
                value={amount}
                onChange={(e) => onAmountChange(e.target.value)}
            />

            <span className="flex flex-shrink-0 items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
                <span className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                    <FallbackImage
                        src={icon}
                        alt=""
                        className="h-full w-full object-cover"
                        fallback={
                            <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-[10px] font-bold text-white">
                                {symbol.slice(0, 2).toUpperCase()}
                            </span>
                        }
                    />
                </span>
                <span className="text-sm font-semibold text-gray-900">{symbol}</span>
            </span>
        </div>
    </div>
);
