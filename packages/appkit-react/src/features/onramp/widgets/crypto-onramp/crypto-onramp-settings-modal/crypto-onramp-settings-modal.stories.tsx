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
import type { CryptoOnrampProvidersMetadata } from '../crypto-onramp-widget-provider/use-crypto-onramp-providers-with-metadata';

const makeProvider = (id: string): CryptoOnrampProvider =>
    ({
        providerId: id,
        type: 'crypto-onramp',
    }) as unknown as CryptoOnrampProvider;

const decent = makeProvider('decent');
const layerswap = makeProvider('layerswap');

const metadata: CryptoOnrampProvidersMetadata = {
    decent: { name: 'Decent' },
    layerswap: { name: 'Layerswap' },
};

const meta: Meta<typeof CryptoOnrampSettingsModal> = {
    title: 'Features/Onramp/Internal/CryptoOnrampSettingsModal',
    component: CryptoOnrampSettingsModal,
};

export default meta;
type Story = StoryObj<typeof CryptoOnrampSettingsModal>;

export const Default: Story = {
    args: {
        open: true,
        provider: decent,
        providers: [decent, layerswap],
        providersMetadata: metadata,
        onClose: () => {},
        onProviderChange: () => {},
    },
};

export const SingleProvider: Story = {
    args: {
        open: true,
        provider: decent,
        providers: [decent],
        providersMetadata: { decent: metadata.decent },
        onClose: () => {},
        onProviderChange: () => {},
    },
};

export const MetadataPartiallyLoaded: Story = {
    args: {
        open: true,
        provider: decent,
        providers: [decent, layerswap],
        // Only one provider has resolved metadata — the other shows its providerId as fallback.
        providersMetadata: { decent: metadata.decent },
        onClose: () => {},
        onProviderChange: () => {},
    },
};

export const MetadataLoading: Story = {
    args: {
        open: true,
        provider: decent,
        providers: [decent, layerswap],
        providersMetadata: {},
        isProvidersMetadataLoading: true,
        onClose: () => {},
        onProviderChange: () => {},
    },
};
