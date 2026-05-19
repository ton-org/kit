/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import type { SwapProvider } from '@ton/appkit';

import { SwapSettingsModal } from './swap-settings-modal';
import type { SwapProvidersMetadata } from '../swap-widget-provider/use-swap-providers-with-metadata';

const makeProvider = (id: string): SwapProvider =>
    ({
        providerId: id,
        type: 'swap',
    }) as unknown as SwapProvider;

const omniston = makeProvider('omniston');
const dedust = makeProvider('dedust');

const metadata: SwapProvidersMetadata = {
    omniston: { name: 'Omniston' },
    dedust: { name: 'DeDust' },
};

const meta: Meta<typeof SwapSettingsModal> = {
    title: 'Features/Swap/Internal/SwapSettingsModal',
    component: SwapSettingsModal,
};

export default meta;
type Story = StoryObj<typeof SwapSettingsModal>;

export const Default: Story = {
    args: {
        open: true,
        slippage: 50,
        provider: omniston,
        providers: [omniston, dedust],
        providersMetadata: metadata,
        onClose: () => {},
        onSlippageChange: () => {},
        onProviderChange: () => {},
    },
};

export const SingleProvider: Story = {
    args: {
        open: true,
        slippage: 100,
        provider: omniston,
        providers: [omniston],
        providersMetadata: { omniston: { name: 'Omniston' } },
        onClose: () => {},
        onSlippageChange: () => {},
        onProviderChange: () => {},
    },
};

export const HighSlippage: Story = {
    args: {
        open: true,
        slippage: 600,
        provider: dedust,
        providers: [omniston, dedust],
        providersMetadata: metadata,
        onClose: () => {},
        onSlippageChange: () => {},
        onProviderChange: () => {},
    },
};

export const MetadataPartiallyLoaded: Story = {
    args: {
        open: true,
        slippage: 50,
        provider: omniston,
        providers: [omniston, dedust],
        // Only one provider has resolved metadata — the other shows its providerId as fallback.
        providersMetadata: { omniston: { name: 'Omniston' } },
        onClose: () => {},
        onSlippageChange: () => {},
        onProviderChange: () => {},
    },
};

export const MetadataLoading: Story = {
    args: {
        open: true,
        slippage: 50,
        provider: omniston,
        providers: [omniston, dedust],
        providersMetadata: {},
        isProvidersMetadataLoading: true,
        onClose: () => {},
        onSlippageChange: () => {},
        onProviderChange: () => {},
    },
};
