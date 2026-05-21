/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { Meta, StoryObj } from '@storybook/react-vite';

import { CryptoOnrampWidget } from './crypto-onramp-widget';

const meta: Meta<typeof CryptoOnrampWidget> = {
    title: 'Features/Onramp/CryptoOnrampWidget',
    component: CryptoOnrampWidget,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CryptoOnrampWidget>;

export const Default: Story = {
    args: {},
};
