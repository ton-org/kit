/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { FC } from 'react';
import { TonIconCircle } from '@ton/appkit-react';

import type { TokenInfo } from '../utils/get-token-summary';

interface TokenSummaryProps {
    tokenType: 'TON' | 'JETTON';
    info: TokenInfo;
}

/**
 * Token avatar + available balance — the static header shown above the form in
 * the transfer modal.
 */
export const TokenSummary: FC<TokenSummaryProps> = ({ tokenType, info }) => (
    <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-tertiary rounded-full flex items-center justify-center overflow-hidden">
            {info.image ? (
                <img src={info.image} alt={info.name} className="w-full h-full object-cover" />
            ) : tokenType === 'TON' ? (
                <TonIconCircle size={40} />
            ) : (
                <span className="text-sm font-bold text-tertiary-foreground">{info.symbol?.slice(0, 2)}</span>
            )}
        </div>
        <div>
            <p className="text-sm font-medium text-foreground">Available Balance</p>
            <p className="text-xs text-tertiary-foreground">
                {info.balance} {info.symbol}
            </p>
        </div>
    </div>
);
