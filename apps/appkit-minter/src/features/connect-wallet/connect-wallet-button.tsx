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

import { ConnectModal } from './connect-modal';

/**
 * Header connect control. Once a wallet is connected it falls back to the stock
 * `TonConnectButton` (account chip + disconnect). While disconnected it opens
 * the TON Connect-styled picker where the demo wallet connects in one click.
 */
export const ConnectWalletButton: FC = () => {
    const address = useAddress();
    const [open, setOpen] = useState(false);

    if (address) {
        return <TonConnectButton />;
    }

    return (
        <>
            <Button variant="fill" size="m" onClick={() => setOpen(true)}>
                Connect wallet
            </Button>
            <ConnectModal open={open} onClose={() => setOpen(false)} />
        </>
    );
};
