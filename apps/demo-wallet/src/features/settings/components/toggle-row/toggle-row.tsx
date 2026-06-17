/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { Info } from 'lucide-react';

import { Popover, PopoverContent, PopoverTrigger } from '@/core/components/ui/popover';

const InfoPopover: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <Popover>
        <PopoverTrigger asChild>
            <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                aria-label={`${label} info`}
            >
                <Info className="w-4 h-4" />
            </button>
        </PopoverTrigger>
        <PopoverContent side="top" align="start" className="w-64 text-xs text-gray-600 leading-relaxed">
            {children}
        </PopoverContent>
    </Popover>
);

interface ToggleRowProps {
    testId: string;
    label: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    info?: React.ReactNode;
}

export const ToggleRow: React.FC<ToggleRowProps> = ({ testId, label, description, checked, onChange, info }) => (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
            <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-gray-900">{label}</span>
                {info && <InfoPopover label={label}>{info}</InfoPopover>}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{description}</p>
        </div>
        <label data-testid={testId} className="relative inline-flex items-center cursor-pointer flex-shrink-0">
            <input
                type="checkbox"
                className="sr-only peer"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
        </label>
    </div>
);
