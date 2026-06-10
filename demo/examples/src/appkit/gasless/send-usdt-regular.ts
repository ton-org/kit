/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { AppKit } from '@ton/appkit';
import { createTransferJettonTransaction, sendTransaction } from '@ton/appkit';

const USDT_MASTER = 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs';
const USDT_DECIMALS = 6;

export const sendUsdtRegularExample = async (appKit: AppKit, recipient: string, amount: string) => {
    // SAMPLE_START: SEND_USDT_REGULAR
    const { messages } = await createTransferJettonTransaction(appKit, {
        jettonAddress: USDT_MASTER,
        recipientAddress: recipient,
        amount,
        jettonDecimals: USDT_DECIMALS,
    });

    await sendTransaction(appKit, { messages });
    // SAMPLE_END: SEND_USDT_REGULAR
};
