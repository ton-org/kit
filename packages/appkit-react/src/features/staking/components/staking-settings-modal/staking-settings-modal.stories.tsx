/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import type { StakingProvider } from '@ton/appkit';

import { StakingSettingsModal } from './staking-settings-modal';
import type { StakingProvidersMetadata } from '../staking-widget-provider/use-staking-providers-with-metadata';

const makeProvider = (id: string): StakingProvider =>
    ({
        providerId: id,
        type: 'staking',
    }) as unknown as StakingProvider;

const tonstakers = makeProvider('tonstakers');
const bemo = makeProvider('bemo');

const metadata: StakingProvidersMetadata = {
    tonstakers: { name: 'Tonstakers' } as StakingProvidersMetadata['tonstakers'],
    bemo: { name: 'bemo' } as StakingProvidersMetadata['bemo'],
};

const meta: Meta<typeof StakingSettingsModal> = {
    title: 'Features/Staking/Internal/StakingSettingsModal',
    component: StakingSettingsModal,
};

export default meta;
type Story = StoryObj<typeof StakingSettingsModal>;

export const Default: Story = {
    args: {
        open: true,
        provider: tonstakers,
        providers: [tonstakers, bemo],
        providersMetadata: metadata,
        onClose: () => {},
        onProviderChange: () => {},
    },
};

export const SingleProvider: Story = {
    args: {
        open: true,
        provider: tonstakers,
        providers: [tonstakers],
        providersMetadata: { tonstakers: metadata.tonstakers },
        onClose: () => {},
        onProviderChange: () => {},
    },
};

export const MetadataPartiallyLoaded: Story = {
    args: {
        open: true,
        provider: tonstakers,
        providers: [tonstakers, bemo],
        // Only one provider has resolved metadata — the other shows its providerId as fallback.
        providersMetadata: { tonstakers: metadata.tonstakers },
        onClose: () => {},
        onProviderChange: () => {},
    },
};

export const MetadataLoading: Story = {
    args: {
        open: true,
        provider: tonstakers,
        providers: [tonstakers, bemo],
        providersMetadata: {},
        isProvidersMetadataLoading: true,
        onClose: () => {},
        onProviderChange: () => {},
    },
};
