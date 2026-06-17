/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { asAddressFriendly } from '@ton/appkit';
import { useGaslessJettonTransferQuote, useSendGaslessTransaction } from '@ton/appkit-react';

const USDT_MASTER = 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs';

export const UseGaslessJettonTransferQuoteExample = () => {
    // SAMPLE_START: USE_GASLESS_JETTON_TRANSFER_QUOTE
    // No manual message building — pass the transfer intent, get a quote back.
    const { data: quote, isFetching } = useGaslessJettonTransferQuote({
        jettonAddress: USDT_MASTER,
        recipientAddress: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
        amount: '100',
        feeAsset: asAddressFriendly(USDT_MASTER),
    });

    const { mutateAsync: sendGasless, isPending } = useSendGaslessTransaction();

    return (
        <div>
            {isFetching && <span>Quoting...</span>}
            {quote && (
                <>
                    <div>Fee: {quote.fee}</div>
                    <button disabled={isPending} onClick={() => sendGasless({ quote })}>
                        Send
                    </button>
                </>
            )}
        </div>
    );
    // SAMPLE_END: USE_GASLESS_JETTON_TRANSFER_QUOTE
};
