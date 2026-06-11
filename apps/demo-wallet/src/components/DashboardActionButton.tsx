/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';

interface DashboardActionButtonProps {
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
    'aria-label'?: string;
}

export const DashboardActionButton: React.FC<DashboardActionButtonProps> = ({
    icon,
    label,
    onClick,
    'aria-label': ariaLabel,
}) => (
    <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel ?? label}
        className="flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-2xl bg-[#F7F8FA] text-gray-900 text-sm font-medium hover:scale-[1.03] active:scale-[0.97] transition-transform"
    >
        {icon}
        <span>{label}</span>
    </button>
);
