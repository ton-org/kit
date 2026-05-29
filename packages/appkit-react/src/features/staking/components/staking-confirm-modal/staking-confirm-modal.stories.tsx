/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import type { StakingProviderInfo, StakingProviderMetadata, StakingQuote } from '@ton/appkit';
import { Network } from '@ton/appkit';

import { StakingConfirmModal } from './staking-confirm-modal';

const network = Network.mainnet();

const providerMetadata = {
    name: 'Tonstakers',
    supportedUnstakeModes: ['INSTANT'],
    supportsReversedQuote: true,
    stakeToken: { ticker: 'TON', decimals: 9, address: 'ton' },
    receiveToken: { ticker: 'tsTON', decimals: 9, address: 'EQC98_qAmNEptUtPc7W6xdHh_ZHrBUFpw5Ft_IzNU20QAJav' },
} as unknown as StakingProviderMetadata;

const providerInfo = {
    apy: 5.42,
    exchangeRate: '1.09288',
} as unknown as StakingProviderInfo;

const stakeQuote = {
    direction: 'stake',
    amountIn: '100',
    amountOut: '91.5',
} as unknown as StakingQuote;

const unstakeQuote = {
    direction: 'unstake',
    amountIn: '91.5',
    amountOut: '100',
} as unknown as StakingQuote;

const meta: Meta<typeof StakingConfirmModal> = {
    title: 'Features/Staking/Internal/StakingConfirmModal',
    component: StakingConfirmModal,
};

export default meta;
type Story = StoryObj<typeof StakingConfirmModal>;

export const Stake: Story = {
    args: {
        open: true,
        direction: 'stake',
        quote: stakeQuote,
        providerInfo,
        providerMetadata,
        isProviderInfoLoading: false,
        isQuoteLoading: false,
        network,
        onClose: () => {},
        onConfirm: () => {},
    },
};

export const Unstake: Story = {
    args: {
        open: true,
        direction: 'unstake',
        quote: unstakeQuote,
        providerInfo,
        providerMetadata,
        isProviderInfoLoading: false,
        isQuoteLoading: false,
        network,
        onClose: () => {},
        onConfirm: () => {},
    },
};
