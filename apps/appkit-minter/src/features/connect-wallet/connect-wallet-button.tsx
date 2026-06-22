/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useState } from 'react';
import type { FC } from 'react';
import { Button, TonConnectButton, useAddress } from '@ton/appkit-react';
import { useTonConnectUI } from '@tonconnect/ui-react';

import { ConnectModal } from './connect-modal';

/** Below this width we hand off to the stock modal (a native mobile bottom-sheet). */
const isMobileViewport = (): boolean =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 600px)').matches;

/**
 * Header connect control. Once a wallet is connected it falls back to the stock
 * `TonConnectButton` (account chip + disconnect). While disconnected, desktop
 * opens our TON Connect-styled picker (one-click demo wallet); mobile opens the
 * stock modal, which renders a native bottom-sheet and lists the demo wallet via
 * `includeWallets` (tapping it deep-links to the demo wallet).
 */
export const ConnectWalletButton: FC = () => {
    const address = useAddress();
    const [tonConnectUI] = useTonConnectUI();
    const [open, setOpen] = useState(false);

    if (address) {
        return <TonConnectButton />;
    }

    const handleClick = () => {
        if (isMobileViewport()) {
            void tonConnectUI.openModal();
        } else {
            setOpen(true);
        }
    };

    return (
        <>
            <Button variant="fill" size="m" onClick={handleClick}>
                Connect wallet
            </Button>
            <ConnectModal open={open} onClose={() => setOpen(false)} />
        </>
    );
};
