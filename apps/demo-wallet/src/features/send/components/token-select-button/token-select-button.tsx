/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { ChevronDown } from 'lucide-react';

import type { TokenOption } from '../../types';

import { FallbackImage } from '@/core/components/ui/fallback-image';
import { formatLargeValue } from '@/core/utils';

interface TokenSelectButtonProps {
    token: TokenOption;
    onClick: () => void;
}

/** Send token row: icon + symbol + chevron on the left, balance on the right. Opens the picker. */
export const TokenSelectButton: React.FC<TokenSelectButtonProps> = ({ token, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-transparent p-3.5 transition-colors hover:border-blue-300 focus:border-blue-500 focus:outline-none"
        data-testid="token-selector"
    >
        <span className="flex min-w-0 items-center gap-2">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                <FallbackImage
                    src={token.icon}
                    alt=""
                    className="h-full w-full object-cover"
                    fallback={
                        <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-bold text-white">
                            {token.fallbackText}
                        </span>
                    }
                />
            </span>
            <span className="truncate text-base font-semibold text-gray-900">{token.symbol}</span>
            <ChevronDown className="h-4 w-4 flex-shrink-0 text-gray-400" />
        </span>
        <span className="flex-shrink-0 text-right">
            <span className="block text-xs text-gray-500">Balance</span>
            <span className="block text-sm font-semibold text-gray-900 tabular-nums">
                {formatLargeValue(String(token.balance), 4)} {token.symbol}
            </span>
        </span>
    </button>
);
