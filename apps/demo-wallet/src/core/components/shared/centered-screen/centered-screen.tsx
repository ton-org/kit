/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface CenteredScreenProps {
    /** Optional back button, pinned at the top. */
    onBack?: () => void;
    /** Optional action area, pinned at the bottom. */
    footer?: React.ReactNode;
    children: React.ReactNode;
}

/**
 * Full-screen onboarding layout: back button pinned top, actions pinned bottom,
 * content vertically centered in between and scrollable when it doesn't fit.
 */
export const CenteredScreen: React.FC<CenteredScreenProps> = ({ onBack, footer, children }) => (
    <div className="h-dvh bg-white select-none flex flex-col">
        <div className="w-full max-w-md mx-auto flex flex-col flex-1 min-h-0">
            {onBack && (
                <div className="flex-shrink-0 px-4 pt-3">
                    <button
                        type="button"
                        onClick={onBack}
                        aria-label="Back"
                        className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                </div>
            )}

            <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="min-h-full flex flex-col justify-center py-6">{children}</div>
            </div>

            {footer && <div className="flex-shrink-0 px-4 pb-6 pt-2">{footer}</div>}
        </div>
    </div>
);
