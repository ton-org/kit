/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { asAddressFriendly } from '@ton/appkit';
import type { Base64String } from '@ton/appkit';
import { useGaslessQuote } from '@ton/appkit-react';

export const UseGaslessQuoteExample = () => {
    // SAMPLE_START: USE_GASLESS_QUOTE
    const { data: quote, isFetching } = useGaslessQuote({
        feeAsset: asAddressFriendly('EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs'), // USDT
        messages: [
            {
                address: 'EQ...jetton_wallet_address',
                amount: '60000000', // 0.06 TON gas budget
                payload: 'te6cckEBAQEAAgAAAA==' as Base64String,
            },
        ],
    });

    return (
        <div>
            {isFetching && <span>Quoting...</span>}
            {quote && (
                <>
                    <div>Fee: {quote.fee}</div>
                    <div>Valid until: {new Date(quote.validUntil * 1000).toISOString()}</div>
                </>
            )}
        </div>
    );
    // SAMPLE_END: USE_GASLESS_QUOTE
};
