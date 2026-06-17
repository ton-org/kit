/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';

import { FallbackImage } from '@/core/components/ui/fallback-image';

interface DappRequestHeaderProps {
    /** Verb line, e.g. "Connect to" / "Sign data for". */
    verb: string;
    /** dApp host/name shown in blue (the "{dApp}?" part). */
    label: string;
    subtitle: string;
    dAppIconUrl?: string;
}

/** Wallet ↔ dApp icon pair + "{verb} {dApp}?" title + subtitle, shared by all dApp request modals. */
export const DappRequestHeader: React.FC<DappRequestHeaderProps> = ({ verb, label, subtitle, dAppIconUrl }) => (
    <div className="flex flex-col items-center text-center">
        <div className="flex items-center gap-3">
            <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gray-100">
                <img src="/walletkit.svg" alt="" className="h-12 w-12" />
            </span>
            <span className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl bg-gray-100">
                <FallbackImage
                    src={dAppIconUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    fallback={
                        <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-2xl font-bold text-white">
                            {label.slice(0, 1).toUpperCase()}
                        </span>
                    }
                />
            </span>
        </div>

        <h2 data-testid="request" className="mt-6 text-2xl font-bold leading-tight text-gray-900">
            {verb}
            <br />
            <span className="text-blue-600">{label}</span>?
        </h2>
        <p className="mt-2 text-base text-gray-500">{subtitle}</p>
    </div>
);
