/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { AppKit } from '@ton/appkit';
import {
    createTransferJettonTransaction,
    getGaslessConfig,
    getGaslessQuote,
    sendGaslessTransaction,
} from '@ton/appkit';

const USDT_MASTER = 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs';
const USDT_DECIMALS = 6;

export const sendUsdtGaslessExample = async (appKit: AppKit, recipient: string, amount: string) => {
    // SAMPLE_START: SEND_USDT_GASLESS
    // Resolve the relayer's address so unspent gas (the jetton `excess`) goes
    // back to the relayer that paid it, not to the user's wallet.
    const { relayAddress } = await getGaslessConfig(appKit);

    // Reuse the same builder as a regular jetton transfer: it resolves the
    // jetton wallet address, builds the payload and attaches the network gas
    // (which the relayer ends up covering) for us.
    const { messages } = await createTransferJettonTransaction(appKit, {
        jettonAddress: USDT_MASTER,
        recipientAddress: recipient,
        amount,
        jettonDecimals: USDT_DECIMALS,
        responseDestination: relayAddress,
    });

    // Pay the relayer's fee in USDT. Quote first so the fee and validity window
    // can be reviewed before the wallet signs.
    const quote = await getGaslessQuote(appKit, { messages, feeAsset: USDT_MASTER });
    await sendGaslessTransaction(appKit, { quote });
    // SAMPLE_END: SEND_USDT_GASLESS
};
