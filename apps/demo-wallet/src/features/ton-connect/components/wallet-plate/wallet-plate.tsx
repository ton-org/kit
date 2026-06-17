/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { ChevronsUpDown, Wallet } from 'lucide-react';

import { cn } from '@/core/lib/utils';

const shorten = (address: string): string =>
    address.length > 16 ? `${address.slice(0, 6)}...${address.slice(-6)}` : address;

interface WalletPlateProps {
    name: string;
    address: string;
    /** Shows the selector chevron and turns the plate into a button (connect modal only). */
    selectable?: boolean;
    onClick?: () => void;
}

/** The "Wallet" row in a dApp request: icon + name + truncated address, with an optional selector. */
export const WalletPlate: React.FC<WalletPlateProps> = ({ name, address, selectable, onClick }) => {
    const className = 'flex w-full items-center gap-3 rounded-2xl border border-gray-200 p-3.5 text-left';
    const content = (
        <>
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                <Wallet className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
                <span className="block truncate font-bold text-gray-900">{name}</span>
                <span className="block truncate text-sm text-gray-500">{shorten(address)}</span>
            </span>
            {selectable && <ChevronsUpDown className="h-5 w-5 flex-shrink-0 text-gray-500" />}
        </>
    );

    if (selectable && onClick) {
        return (
            <button
                type="button"
                onClick={onClick}
                className={cn(className, 'transition-colors hover:border-gray-300')}
            >
                {content}
            </button>
        );
    }
    return <div className={className}>{content}</div>;
};
