/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { Network } from '@ton/appkit';

import { FlowPreview } from './flow-preview';
import type { AppkitUIToken } from '../../../types/appkit-ui-token';

const tonToken: AppkitUIToken = {
    symbol: 'GRAM',
    name: 'Gram',
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

const meta: Meta<typeof FlowPreview> = {
    title: 'Components/Shared/FlowPreview',
    component: FlowPreview,
};

export default meta;
type Story = StoryObj<typeof FlowPreview>;

export const Default: Story = {
    args: {
        fromAmount: '100',
        toAmount: '227.52',
        fromToken: tonToken,
        toToken: usdtToken,
        fiatSymbol: '$',
    },
};
