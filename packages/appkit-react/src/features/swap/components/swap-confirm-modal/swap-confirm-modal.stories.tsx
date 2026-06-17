/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import type { SwapProvider, SwapQuote } from '@ton/appkit';

import { SwapConfirmModal } from './swap-confirm-modal';
import type { AppkitUIToken } from '../../../../types/appkit-ui-token';

const tonToken = {
    symbol: 'GRAM',
    name: 'Gram',
    decimals: 9,
    address: 'ton',
    rate: '2.28',
} as unknown as AppkitUIToken;

const usdtToken = {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    address: 'EQB-MPwrd1G6WKNkLz_VnV6WqBDd142KMQv-g1O-8QUA3728',
    rate: '1.0',
} as unknown as AppkitUIToken;

const quote = {
    minReceived: '226382400',
    providerId: 'stonfi',
} as unknown as SwapQuote;

const provider = {
    getMetadata: () => ({ name: 'STON.fi' }),
} as unknown as SwapProvider;

const meta: Meta<typeof SwapConfirmModal> = {
    title: 'Features/Swap/Internal/SwapConfirmModal',
    component: SwapConfirmModal,
};

export default meta;
type Story = StoryObj<typeof SwapConfirmModal>;

export const Default: Story = {
    args: {
        open: true,
        fromToken: tonToken,
        toToken: usdtToken,
        fromAmount: '100',
        toAmount: '227.52',
        fiatSymbol: '$',
        quote,
        swapProvider: provider,
        slippage: 50,
        isQuoteLoading: false,
        onClose: () => {},
        onConfirm: () => {},
    },
};
