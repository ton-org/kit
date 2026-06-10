/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Switch } from './switch';

const meta: Meta<typeof Switch> = {
    title: 'Components/UI/Switch',
    component: Switch,
    tags: ['autodocs'],
    argTypes: {
        size: {
            control: 'radio',
            options: ['sm', 'default'],
        },
        disabled: {
            control: 'boolean',
        },
    },
};

export default meta;

type Story = StoryObj<typeof Switch>;

export const DefaultUnchecked: Story = {
    args: {
        size: 'default',
    },
};

export const DefaultChecked: Story = {
    args: {
        size: 'default',
        defaultChecked: true,
    },
};

export const Controlled: Story = {
    render: (args) => {
        const ControlledExample = () => {
            const [checked, setChecked] = useState(false);
            return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Switch {...args} checked={checked} onCheckedChange={setChecked} />
                    <span style={{ color: 'var(--ta-color-text-secondary)' }}>{checked ? 'On' : 'Off'}</span>
                </div>
            );
        };
        return <ControlledExample />;
    },
};

export const Disabled: Story = {
    args: {
        size: 'default',
        defaultChecked: true,
        disabled: true,
    },
};

export const Small: Story = {
    args: {
        size: 'sm',
        defaultChecked: true,
    },
};
