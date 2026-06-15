/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { ChevronRight, Loader2 } from 'lucide-react';

export interface OptionRowProps {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    loading?: boolean;
    disabled?: boolean;
    onClick?: () => void;
    testId?: string;
}

/** Selectable list row: leading icon, title/subtitle, trailing chevron (or spinner). */
export const OptionRow: React.FC<OptionRowProps> = ({
    icon,
    title,
    subtitle,
    loading = false,
    disabled = false,
    onClick,
    testId,
}) => (
    <button
        type="button"
        data-testid={testId}
        onClick={onClick}
        disabled={disabled}
        className="w-full flex items-center gap-3 bg-[#F7F8FA] rounded-2xl px-4 py-4 text-left transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:hover:scale-100 disabled:active:scale-100"
    >
        <span className="flex-shrink-0 flex items-center justify-center text-gray-900">{icon}</span>
        <div className="flex-1 min-w-0">
            <div className="text-base font-bold text-gray-900 truncate">{title}</div>
            <div className="text-sm text-gray-400 truncate">{subtitle}</div>
        </div>
        {loading ? (
            <Loader2 className="w-5 h-5 text-gray-400 flex-shrink-0 animate-spin" />
        ) : (
            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
        )}
    </button>
);
