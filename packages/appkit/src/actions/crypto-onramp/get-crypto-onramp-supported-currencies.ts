/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { CryptoOnrampSupportedCurrencies } from '../../crypto-onramp';
import type { AppKit } from '../../core/app-kit';

export interface GetCryptoOnrampSupportedCurrenciesOptions {
    providerId?: string;
}

export type GetCryptoOnrampSupportedCurrenciesReturnType = Promise<CryptoOnrampSupportedCurrencies>;

/**
 * Discover supported source/destination currencies for a crypto-onramp provider.
 */
export const getCryptoOnrampSupportedCurrencies = async (
    appKit: AppKit,
    options: GetCryptoOnrampSupportedCurrenciesOptions = {},
): GetCryptoOnrampSupportedCurrenciesReturnType => {
    return appKit.cryptoOnrampManager.getSupportedCurrencies(options.providerId);
};
