/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { Meta, StoryObj } from '@storybook/react-vite';

import { CryptoOnrampRefundAddressModal } from './crypto-onramp-refund-address-modal';

const meta: Meta<typeof CryptoOnrampRefundAddressModal> = {
    title: 'Features/Onramp/Internal/CryptoOnrampRefundAddressModal',
    component: CryptoOnrampRefundAddressModal,
};

export default meta;
type Story = StoryObj<typeof CryptoOnrampRefundAddressModal>;

export const Default: Story = {
    args: {
        open: true,
        isLoading: false,
        onClose: () => {},
        onConfirm: () => {},
    },
};

export const WithError: Story = {
    args: {
        ...Default.args,
        error: 'Invalid refund address',
    },
};

export const Loading: Story = {
    args: {
        ...Default.args,
        isLoading: true,
    },
};

export const Optional: Story = {
    args: {
        ...Default.args,
        onSkip: () => {},
    },
};
