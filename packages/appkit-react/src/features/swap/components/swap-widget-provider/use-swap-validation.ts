/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useMemo } from 'react';
import type { SwapQuote } from '@ton/appkit';

import type { AppkitUIToken } from '../../../../types/appkit-ui-token';
import { hasTooManyDecimals, isAmountExceedingBalance } from '../../../../utils/validate-amount';
import { mapSwapError } from '../../utils/map-swap-error';

interface UseSwapValidationOptions {
    fromAmount: string;
    fromAmountDebounced: string;
    fromToken: AppkitUIToken | null;
    toToken: AppkitUIToken | null;
    fromBalance: string | undefined;
    quote: SwapQuote | undefined;
    quoteError: Error | null;
    sendError: Error | null;
    isNetworkSupported: boolean;
}

export const useSwapValidation = ({
    fromAmount,
    fromAmountDebounced,
    fromToken,
    toToken,
    fromBalance,
    quote,
    quoteError,
    sendError,
    isNetworkSupported,
}: UseSwapValidationOptions) => {
    const blockingError: string | null = useMemo(() => {
        if (!isNetworkSupported) return 'defi.unsupportedNetwork';

        if ((parseFloat(fromAmount) || 0) <= 0) return null;

        if (hasTooManyDecimals(fromAmount, fromToken?.decimals)) return 'swap.tooManyDecimals';

        if (isAmountExceedingBalance(fromAmount, fromBalance)) return 'swap.insufficientBalance';

        if (quoteError && fromAmountDebounced) return mapSwapError(quoteError);

        return null;
    }, [isNetworkSupported, fromAmount, fromToken, fromBalance, quoteError, fromAmountDebounced]);

    const error = useMemo<string | null>(() => {
        if (sendError) return mapSwapError(sendError, 'swap.sendFailed');
        return blockingError;
    }, [sendError, blockingError]);

    const canSubmit =
        (parseFloat(fromAmount) || 0) > 0 &&
        fromToken !== null &&
        toToken !== null &&
        blockingError === null &&
        quote !== undefined;

    return { error, canSubmit };
};
