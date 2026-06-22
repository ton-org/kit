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
            className="flex w-full flex-col items-center rounded-2xl px-1 py-2 transition-transform hover:scale-[1.04] active:scale-95"
        >
            <span className="mb-2 flex size-[60px] items-center justify-center overflow-hidden rounded-2xl bg-[#2a2a2d]">
                {icon ?? <img src={iconUrl} alt="" className="size-full object-cover" />}
            </span>
            <span className="line-clamp-2 w-full text-center text-sm font-medium leading-[1.3] text-white">{name}</span>
            {sublabel && <span className="text-sm leading-[1.3] text-[#8b8b8e]">{sublabel}</span>}
        </button>
    );
};
