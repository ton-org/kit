/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';

interface NewLayoutProps {
    header?: React.ReactNode;
    children: React.ReactNode;
}

export const NewLayout: React.FC<NewLayoutProps> = ({ header, children }) => (
    <div className="min-h-screen bg-white select-none">
        <div className="max-w-md mx-auto relative">
            {header}
            <main className="px-4 pb-6">{children}</main>
        </div>
    </div>
);
