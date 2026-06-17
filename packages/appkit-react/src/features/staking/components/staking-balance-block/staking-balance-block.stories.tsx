/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { UnstakeMode } from '@ton/appkit';

import { StakingBalanceBlock } from './staking-balance-block';

const meta: Meta<typeof StakingBalanceBlock> = {
    title: 'Features/Staking/Internal/StakingBalanceBlock',
    component: StakingBalanceBlock,
};

export default meta;
type Story = StoryObj<typeof StakingBalanceBlock>;

const mockMetadata = {
    providerId: 'tonstakers',
    name: 'Tonstakers',
    description: 'Staking provider',
    logo: './tokens/tston.svg',
    stakeToken: {
        symbol: 'GRAM',
        ticker: 'GRAM',
        decimals: 9,
        address: 'ton',
    },
    receiveToken: {
        symbol: 'tsTON',
        ticker: 'tsTON',
        decimals: 9,
        address: 'EQC98_qAmNEptUtPc7W6xdHh_ZHrBUFpw5Ft_IzNU20QAJav',
    },
    supportedUnstakeModes: [UnstakeMode.INSTANT, UnstakeMode.ROUND_END],
    supportsReversedQuote: false,
};

export const Stake: Story = {
    args: {
        direction: 'stake',
        providerMetadata: mockMetadata,
        balance: '10000000000', // 10 GRAM
        isBalanceLoading: false,
    },
};

export const Unstake: Story = {
    args: {
        direction: 'unstake',
        providerMetadata: mockMetadata,
        stakedBalance: '5000000000', // 5 tsTON
        isStakedBalanceLoading: false,
    },
};

export const Loading: Story = {
    args: {
        direction: 'stake',
        providerMetadata: mockMetadata,
        isBalanceLoading: true,
    },
};
