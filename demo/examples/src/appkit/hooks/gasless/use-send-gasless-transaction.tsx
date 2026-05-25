/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { asAddressFriendly } from '@ton/appkit';
import type { Base64String } from '@ton/appkit';
import { useGaslessQuote, useSendGaslessTransaction } from '@ton/appkit-react';

/* eslint-disable no-console */

export const UseSendGaslessTransactionExample = () => {
    // SAMPLE_START: USE_SEND_GASLESS_TRANSACTION
    const { data: quote } = useGaslessQuote({
        feeAsset: asAddressFriendly('EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs'),
        messages: [
            {
                address: 'EQ...jetton_wallet_address',
                amount: '60000000',
                payload: 'te6cckEBAQEAAgAAAA==' as Base64String,
            },
        ],
    });
    const { mutateAsync: sendGasless, isPending } = useSendGaslessTransaction();

    const handleSend = async () => {
        if (!quote) return;
        try {
            const { internalBoc, normalizedHash } = await sendGasless({ quote });
            console.log('Submitted. Hash:', normalizedHash, 'BoC:', internalBoc);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <button onClick={handleSend} disabled={!quote || isPending}>
            {isPending ? 'Sending...' : 'Send Gasless'}
        </button>
    );
    // SAMPLE_END: USE_SEND_GASLESS_TRANSACTION
};
