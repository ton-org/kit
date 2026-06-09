/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { FC } from 'react';
import clsx from 'clsx';

import { ChevronsIcon } from '../../ui/icons';
import { Select } from '../../ui/select';
import { Skeleton } from '../../ui/skeleton';
import styles from './option-switcher.module.css';

export interface OptionSwitcherOption {
    value: string;
    label: string;
}

export interface OptionSwitcherProps {
    /** Currently selected option value. */
    value: string | undefined;
    /** Available options. */
    options: OptionSwitcherOption[];
    /** Called when the user picks an option. */
    onChange: (value: string) => void;
    /** When true, the trigger is non-interactive and dimmed. */
    disabled?: boolean;
    /** When true, replaces the trigger content with a skeleton and disables interaction. */
    loading?: boolean;
    className?: string;
}

/**
 * Compact selector used inside settings modals next to a label.
 */
export const OptionSwitcher: FC<OptionSwitcherProps> = ({ value, options, onChange, disabled, loading, className }) => {
    const current = options.find((option) => option.value === value);
    const currentLabel = current?.label ?? value ?? '—';

    return (
        <Select.Root value={value} onValueChange={onChange} disabled={disabled || loading}>
            <Select.Trigger variant="unstyled" size="unset" className={clsx(styles.button, className)}>
                {loading ? (
                    <Skeleton width={80} height={16} />
                ) : (
                    <>
                        {currentLabel}
                        <ChevronsIcon size={20} />
                    </>
                )}
            </Select.Trigger>
            <Select.Content align="end">
                {options.map((option) => (
                    <Select.Item key={option.value} value={option.value}>
                        {option.label}
                    </Select.Item>
                ))}
            </Select.Content>
        </Select.Root>
    );
};
