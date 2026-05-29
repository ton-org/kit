/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { Network } from '@ton/appkit';

import { AmountPreview } from './amount-preview';
import type { AppkitUIToken } from '../../../types/appkit-ui-token';

const tonToken: AppkitUIToken = {
    symbol: 'TON',
    name: 'Toncoin',
    decimals: 9,
    address: 'ton',
    network: Network.mainnet(),
    rate: '2.28',
};

const usdtToken: AppkitUIToken = {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    address: 'EQB-MPwrd1G6WKNkLz_VnV6WqBDd142KMQv-g1O-8QUA3728',
    network: Network.mainnet(),
    rate: '1.0',
};

const meta: Meta<typeof AmountPreview> = {
    title: 'Components/Shared/AmountPreview',
    component: AmountPreview,
};

export default meta;
type Story = StoryObj<typeof AmountPreview>;

export const Default: Story = {
    args: {
        amount: '100',
        token: tonToken,
        fiatSymbol: '$',
    },
};

export const NoRate: Story = {
    args: {
        amount: '100',
        token: { ...tonToken, rate: undefined },
        fiatSymbol: '$',
    },
};

export const WithFiatDelta: Story = {
    args: {
        amount: '227.52',
        token: usdtToken,
        fiatSymbol: '$',
        fiatDelta: -0.0025,
    },
};
