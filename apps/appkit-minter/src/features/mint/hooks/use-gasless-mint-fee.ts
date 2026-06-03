/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useJettonInfo } from '@ton/appkit-react';
import { formatUnits } from '@ton/appkit';
import type { GaslessQuote, UserFriendlyAddress } from '@ton/appkit';

/**
 * Formats a gasless quote's fee against the selected fee-asset's metadata
 * (decimals + symbol). Returns `undefined` until the jetton info resolves or
 * if the quote isn't available — callers render a skeleton/placeholder.
 *
 * Lives in its own hook because it's a presentation concern (a formatted
 * display string), not part of the mint orchestration.
 */
export const useGaslessMintFee = (
    quote: GaslessQuote | undefined,
    feeAsset: UserFriendlyAddress | null | undefined,
): string | undefined => {
    const { data: feeAssetInfo } = useJettonInfo({
        address: feeAsset ?? undefined,
        query: { enabled: !!feeAsset },
    });

    if (!quote || feeAssetInfo?.decimals == null) return undefined;
    return `${formatUnits(quote.fee, feeAssetInfo.decimals)} ${feeAssetInfo.symbol ?? ''}`.trim();
};
