/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface ScreenHeaderProps {
    title: string;
    /** Back action; the back button is hidden when omitted. */
    onBack?: () => void;
}

/** Page header for NewLayout: a round back button (same style as the modal close button) plus a title. */
export const ScreenHeader: React.FC<ScreenHeaderProps> = ({ title, onBack }) => (
    <header className="flex items-center gap-3 px-4 py-5">
        {onBack && (
            <button
                type="button"
                onClick={onBack}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors flex-shrink-0"
                aria-label="Back"
            >
                <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
            </button>
        )}
        <h1 className="text-xl font-bold text-gray-900 truncate">{title}</h1>
    </header>
);
