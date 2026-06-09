/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { Caip2ByNetwork } from '@ton/appkit';
import type { CryptoOnrampDestinationCurrency, CryptoOnrampSourceCurrency } from '@ton/appkit';

import { CryptoOnrampWidget } from './crypto-onramp-widget';

const USDT_ON_TON: CryptoOnrampDestinationCurrency = {
    address: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
    symbol: 'USDT',
    name: 'Tether',
    decimals: 6,
    logo: 'https://cdn.layerswap.io/layerswap/currencies/usdt.png',
};

const USDT0_ON_ARBITRUM: CryptoOnrampSourceCurrency = {
    chain: Caip2ByNetwork.ArbitrumMainnet,
    address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
    symbol: 'USDT0',
    name: 'Tether USD0',
    decimals: 6,
    logo: 'https://cdn.layerswap.io/layerswap/currencies/usdt0.png',
};

const meta: Meta<typeof CryptoOnrampWidget> = {
    title: 'Features/Onramp/CryptoOnrampWidget',
    component: CryptoOnrampWidget,
    tags: ['autodocs'],
    argTypes: {
        defaultDestination: {
            control: 'object',
            description: 'Optional initial destination (TON-side) currency. Omit to start with empty selector.',
        },
        defaultSource: {
            control: 'object',
            description: 'Optional initial source currency. Omit to start with empty selector.',
        },
    },
};

export default meta;
type Story = StoryObj<typeof CryptoOnrampWidget>;

/**
 * No defaults — selectors start empty. While `/supportedCurrencies` is loading the pills
 * show skeletons; once data arrives the auto-pick effect seeds them with the first
 * available token/method.
 */
export const Default: Story = {
    args: {},
};

/**
 * Consumer-supplied defaults — selectors render with the chosen token/method immediately
 * on first paint. Auto-pick is skipped because the state isn't null. Use the controls
 * panel to swap the objects.
 */
export const WithPresetCurrencies: Story = {
    args: {
        defaultDestination: USDT_ON_TON,
        defaultSource: USDT0_ON_ARBITRUM,
    },
};
