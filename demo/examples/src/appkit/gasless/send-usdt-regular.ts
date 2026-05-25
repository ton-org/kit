/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { AppKit } from '@ton/appkit';
import {
    asBase64,
    createJettonTransferPayload,
    getJettonWalletAddress,
    getSelectedWallet,
    parseUnits,
    sendTransaction,
} from '@ton/appkit';

const USDT_MASTER = 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs';
const USDT_DECIMALS = 6;

export const sendUsdtRegularExample = async (appKit: AppKit, recipient: string, amount: string) => {
    // SAMPLE_START: SEND_USDT_REGULAR
    const wallet = getSelectedWallet(appKit);
    if (!wallet) throw new Error('No wallet connected');
    const ownerAddress = wallet.getAddress();

    const usdtWallet = await getJettonWalletAddress(appKit, {
        jettonAddress: USDT_MASTER,
        ownerAddress,
    });

    const payload = createJettonTransferPayload({
        amount: parseUnits(amount, USDT_DECIMALS),
        destination: recipient,
        responseDestination: ownerAddress,
    });

    const messages = [
        {
            address: usdtWallet,
            amount: parseUnits('0.06', 9).toString(), // 0.06 TON for gas
            payload: asBase64(payload.toBoc().toString('base64')),
        },
    ];

    await sendTransaction(appKit, { messages });
    // SAMPLE_END: SEND_USDT_REGULAR
};
