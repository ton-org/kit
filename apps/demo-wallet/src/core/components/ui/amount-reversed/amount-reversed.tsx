/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { ComponentProps, FC } from 'react';

import { cn } from '@/core/lib/utils';
import { formatLargeValue } from '@/core/utils';

export interface AmountReversedProps extends ComponentProps<'div'> {
    value: string;
    ticker?: string;
    symbol?: string;
    decimals?: number;
    errorMessage?: string;
    isLoading?: boolean;
}

/** Read-only secondary amount shown under the centered input (e.g. the fiat equivalent). */
export const AmountReversed: FC<AmountReversedProps> = ({
    value,
    ticker,
    symbol,
    decimals,
    errorMessage,
    isLoading,
    className,
    ...props
}) => {
    const containerClass = cn(
        'flex w-full items-center justify-center gap-2 text-base font-semibold text-gray-500',
        className,
    );

    if (errorMessage) {
        return (
            <div className={containerClass} {...props}>
                {errorMessage}
            </div>
        );
    }

    return (
        <div className={containerClass} {...props}>
            {isLoading ? (
                <span className="h-5 w-[70px] animate-pulse rounded bg-gray-200" />
            ) : (
                <span>
                    {symbol}
                    {value ? formatLargeValue(value, decimals) : '0'}
                    {ticker ? ` ${ticker}` : ''}
                </span>
            )}
        </div>
    );
};
