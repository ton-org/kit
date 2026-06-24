/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { ComponentProps, FC } from 'react';

import { Button } from '@/core/components/ui/button';
import { cn } from '@/core/lib/utils';

export interface AmountPreset {
    label: string;
    amount: string;
    onSelect?: () => void;
}

export interface AmountPresetsProps extends ComponentProps<'div'> {
    presets: AmountPreset[];
    currencySymbol?: string;
    onPresetSelect: (value: string) => void;
}

/** Row of quick-amount buttons (e.g. 10% / 25% / 50% / MAX). Ported from appkit-react. */
export const AmountPresets: FC<AmountPresetsProps> = ({
    presets,
    currencySymbol,
    onPresetSelect,
    className,
    ...props
}) => (
    <div className={cn('mx-auto grid w-full grid-cols-4 gap-2', className)} {...props}>
        {presets.map((preset) => (
            <Button
                key={preset.label}
                size="sm"
                variant="secondary"
                className="w-full whitespace-nowrap"
                onClick={() => (preset.onSelect ? preset.onSelect() : onPresetSelect(preset.amount))}
            >
                {currencySymbol}
                {preset.label}
            </Button>
        ))}
    </div>
);
