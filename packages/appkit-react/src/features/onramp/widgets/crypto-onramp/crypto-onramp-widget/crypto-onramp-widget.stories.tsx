/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { Caip2ByNetwork } from '@ton/appkit';

import type { CryptoOnrampDestinationRef, CryptoOnrampSourceRef } from '../crypto-onramp-widget-provider';
import { CryptoOnrampWidget } from './crypto-onramp-widget';

const USDT_ON_TON: CryptoOnrampDestinationRef = {
    address: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
};

const USDT0_ON_ARBITRUM: CryptoOnrampSourceRef = {
    chain: Caip2ByNetwork.ArbitrumMainnet,
    address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
};

const meta: Meta<typeof CryptoOnrampWidget> = {
    title: 'Features/Onramp/CryptoOnrampWidget',
    component: CryptoOnrampWidget,
    tags: ['autodocs'],
    argTypes: {
        defaultDestination: {
            control: 'object',
            description:
                'Optional default destination reference (`{ address }`), resolved against the loaded currency list.',
        },
        defaultSource: {
            control: 'object',
            description:
                'Optional default source reference (`{ address, chain? }`), resolved against the loaded currency list.',
        },
    },
};

export default meta;
type Story = StoryObj<typeof CryptoOnrampWidget>;

/**
 * No defaults — while `/supportedCurrencies` is loading the pills show skeletons and the
 * amount caption reads "Loading..."; once data arrives the first available token/method
 * is auto-picked. The "Select token" empty state only shows when the lists come back empty.
 */
export const Default: Story = {
    args: {},
};

/**
 * Consumer-supplied default references — once the currency list loads, the matching
 * entries are selected instead of the first ones. Unmatched references fall back to
 * the first entry. Use the controls panel to tweak the references.
 */
export const WithPresetCurrencies: Story = {
    args: {
        defaultDestination: USDT_ON_TON,
        defaultSource: USDT0_ON_ARBITRUM,
    },
};
