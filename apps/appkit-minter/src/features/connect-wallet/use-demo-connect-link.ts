/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useCallback } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';

import { DEMO_WALLET_BRIDGE_URL, DEMO_WALLET_UNIVERSAL_LINK } from './constants';

/**
 * Returns a function that builds a fresh TON Connect connection request for the
 * demo wallet and yields its universal link. The same link backs both the QR
 * code and the one-click "open in a new tab" action, so the demo wallet
 * connects back over the shared bridge however the user starts it.
 */
export function useDemoConnectLink(): () => string | null {
    const [tonConnectUI] = useTonConnectUI();

    return useCallback(() => {
        if (tonConnectUI.connected) {
            return null;
        }

        const link = tonConnectUI.connector.connect({
            universalLink: DEMO_WALLET_UNIVERSAL_LINK,
            bridgeUrl: DEMO_WALLET_BRIDGE_URL,
        });

        if (typeof link !== 'string') {
            return null;
        }

        // Tell the demo wallet where to send the user back once it finishes
        // connecting, so it can auto-return to this app.
        const url = new URL(link);
        url.searchParams.set('ret', window.location.href);
        return url.toString();
    }, [tonConnectUI]);
}
