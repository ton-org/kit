/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { CurrencyItem } from './currency-item';

const meta: Meta<typeof CurrencyItem> = {
    title: 'Features/Balances/CurrencyItem',
    component: CurrencyItem,
    tags: ['autodocs'],
    args: {
        onClick: fn(),
    },
};

export default meta;

type Story = StoryObj<typeof CurrencyItem>;

export const GRAM: Story = {
    args: {
        ticker: 'GRAM',
        name: 'Gram',
        balance: '55',
        icon: './tokens/gram.svg',
        isVerified: true,
    },
};

export const USDT: Story = {
    args: {
        ticker: 'USDT',
        name: 'Tether USD',
        balance: '10',
        isVerified: true,
    },
};

export const Unverified: Story = {
    args: {
        ticker: 'MEME',
        name: 'Meme Token',
        balance: '10000',
        isVerified: false,
    },
};

export const ZeroBalance: Story = {
    args: {
        ticker: 'GRAM',
        name: 'Gram',
        balance: '0',
        icon: './tokens/gram.svg',
        isVerified: true,
    },
};

export const NoBalance: Story = {
    args: {
        ticker: 'GRAM',
        name: 'Gram',
        icon: './tokens/gram.svg',
        isVerified: true,
    },
};

export const CurrencyList: Story = {
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '320px' }}>
            <CurrencyItem
                ticker="GRAM"
                name="Gram"
                balance="55"
                icon="./tokens/gram.svg"
                isVerified={true}
                onClick={fn()}
            />
            <CurrencyItem ticker="USDT" name="Tether USD" balance="10" isVerified={true} onClick={fn()} />
            <CurrencyItem ticker="NOT" name="Notcoin" balance="500" isVerified={true} onClick={fn()} />
        </div>
    ),
};
