/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { FC } from 'react';

interface ViewAllIconProps {
    /** Up to four wallet icon URLs rendered as a 2x2 grid. */
    iconUrls: string[];
}

/**
 * The "View all wallets" tile icon — a 2x2 grid of wallet logos, mirroring the
 * TON Connect modal.
 */
export const ViewAllIcon: FC<ViewAllIconProps> = ({ iconUrls }) => {
    const icons = iconUrls.slice(0, 4);

    return (
        <span className="grid size-full grid-cols-2 grid-rows-2 gap-0.5 p-1.5">
            {icons.map((url, i) => (
                <img key={`${url}-${i}`} src={url} alt="" className="size-full rounded-[5px] object-cover" />
            ))}
        </span>
    );
};
