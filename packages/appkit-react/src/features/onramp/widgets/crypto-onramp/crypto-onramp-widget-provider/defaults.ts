/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { CryptoOnrampDestinationCurrency, CryptoOnrampSourceCurrency } from '@ton/appkit';

/**
 * Default destination currency shown by the widget on first render — USDT on TON.
 *
 * Renderable immediately (logo + symbol included) so the input row never flashes empty
 * while `getSupportedCurrencies()` is still in flight. If the default isn't supported by
 * the active provider, the quote request returns an error and the widget surfaces it
 * verbatim — the selection itself isn't auto-corrected.
 */
export const DEFAULT_DESTINATION_CURRENCY: CryptoOnrampDestinationCurrency = {
    address: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
    symbol: 'USDT',
    name: 'Tether',
    decimals: 6,
    logo: 'https://cdn.layerswap.io/layerswap/currencies/usdt.png',
};

/**
 * Default source currency shown by the widget on first render — USDT0 on Arbitrum.
 *
 * See {@link DEFAULT_DESTINATION_CURRENCY} for why this is hardcoded.
 */
export const DEFAULT_SOURCE_CURRENCY: CryptoOnrampSourceCurrency = {
    chain: 'eip155:42161',
    address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
    symbol: 'USDT0',
    name: 'Tether USD0',
    decimals: 6,
    logo: 'https://cdn.layerswap.io/layerswap/currencies/usdt0.png',
};
