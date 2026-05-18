/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CryptoOnrampProvider } from '@ton/appkit';

import { CryptoOnrampSettingsModal } from './crypto-onramp-settings-modal';

const makeProvider = (id: string, name: string): CryptoOnrampProvider =>
    ({
        providerId: id,
        type: 'crypto-onramp',
        getMetadata: () => ({ name }),
    }) as unknown as CryptoOnrampProvider;

const swapsXyz = makeProvider('swaps-xyz', 'Swaps.xyz');
const layerswap = makeProvider('layerswap', 'Layerswap');

const meta: Meta<typeof CryptoOnrampSettingsModal> = {
    title: 'Features/Onramp/Internal/CryptoOnrampSettingsModal',
    component: CryptoOnrampSettingsModal,
};

export default meta;
type Story = StoryObj<typeof CryptoOnrampSettingsModal>;

export const Default: Story = {
    args: {
        open: true,
        provider: swapsXyz,
        providers: [swapsXyz, layerswap],
        onClose: () => {},
        onProviderChange: () => {},
    },
};

export const SingleProvider: Story = {
    args: {
        open: true,
        provider: swapsXyz,
        providers: [swapsXyz],
        onClose: () => {},
        onProviderChange: () => {},
    },
};
