/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { Settings2 } from 'lucide-react';

import { cn } from '@/core/lib/utils';

interface SettingsButtonProps {
    onClick: () => void;
    className?: string;
    'aria-label'?: string;
}

/** Square gear button sized to sit next to a full-width `lg` action button (Swap / Staking). */
export const SettingsButton: React.FC<SettingsButtonProps> = ({
    onClick,
    className,
    'aria-label': ariaLabel = 'Settings',
}) => (
    <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        className={cn(
            'flex size-13 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200',
            className,
        )}
    >
        <Settings2 className="h-5 w-5" />
    </button>
);
