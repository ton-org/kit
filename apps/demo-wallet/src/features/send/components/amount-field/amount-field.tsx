/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';

import type { TokenOption } from '../../types';

import { CenteredAmountInput } from '@/core/components/ui/centered-amount-input';
import { AmountReversed } from '@/core/components/ui/amount-reversed';
import { AmountPresets } from '@/core/components/shared/amount-presets';

/** Clamp a numeric amount to a clean decimal string (no trailing zeros, no exponent). */
const toAmountString = (value: number, decimals: number): string => {
    if (!Number.isFinite(value) || value <= 0) return '0';
    const fixed = value.toFixed(Math.min(decimals, 9));
    return fixed.includes('.') ? fixed.replace(/\.?0+$/, '') : fixed;
};

interface AmountFieldProps {
    value: string;
    onChange: (value: string) => void;
    token: TokenOption;
}

/** Centered amount input with a fiat sub-line and percentage presets. */
export const AmountField: React.FC<AmountFieldProps> = ({ value, onChange, token }) => {
    const amountNumber = parseFloat(value) || 0;
    const fiatValue = token.rate !== undefined ? String(amountNumber * token.rate) : undefined;
    const presets = [
        { label: '10%', amount: toAmountString(token.balance * 0.1, token.decimals) },
        { label: '25%', amount: toAmountString(token.balance * 0.25, token.decimals) },
        { label: '50%', amount: toAmountString(token.balance * 0.5, token.decimals) },
        { label: 'MAX', amount: toAmountString(token.maxSendable, token.decimals) },
    ];

    const handleAmountChange = (raw: string) => {
        // Keep digits and a single decimal separator (the input is free-form text).
        onChange(raw.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'));
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2 py-2">
                <CenteredAmountInput
                    value={value}
                    onValueChange={handleAmountChange}
                    ticker={token.symbol}
                    baseTestId="send-amount"
                />
                {fiatValue !== undefined && <AmountReversed value={fiatValue} symbol="≈$" decimals={2} />}
            </div>
            <AmountPresets presets={presets} onPresetSelect={onChange} />
        </div>
    );
};
