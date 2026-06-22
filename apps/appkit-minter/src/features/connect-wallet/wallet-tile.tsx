/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { FC, ReactNode } from 'react';

interface WalletTileProps {
    name: string;
    onClick: () => void;
    /** Wallet icon URL. Omit when rendering a custom `icon` node instead. */
    iconUrl?: string;
    /** Custom icon node (e.g. the "View all wallets" grid). Overrides `iconUrl`. */
    icon?: ReactNode;
    /** Small grey line under the name, e.g. "Recent". */
    sublabel?: string;
}

/**
 * A single wallet tile matching the TON Connect modal's "Available wallets"
 * row: a rounded-square icon above a name with an optional grey sublabel.
 */
export const WalletTile: FC<WalletTileProps> = ({ name, onClick, iconUrl, icon, sublabel }) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex w-[88px] flex-col items-center gap-2 rounded-2xl px-1 py-2 transition-transform hover:scale-[1.04] active:scale-95"
        >
            <span className="flex size-[60px] items-center justify-center overflow-hidden rounded-[14px] bg-[#2a2a2d]">
                {icon ?? <img src={iconUrl} alt="" className="size-full object-cover" />}
            </span>
            <span className="line-clamp-2 w-full text-center text-[13px] font-medium leading-tight text-white">
                {name}
            </span>
            {sublabel && <span className="-mt-1.5 text-[12px] leading-tight text-[#8b8b8e]">{sublabel}</span>}
        </button>
    );
};
