/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useState } from 'react';
import type { ButtonHTMLAttributes, FC, MouseEventHandler } from 'react';
import clsx from 'clsx';

import styles from './switch.module.css';

export interface SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'onChange'> {
    /** Controlled checked state. Omit to use uncontrolled mode with `defaultChecked`. */
    checked?: boolean;
    /** Initial checked state for uncontrolled mode. */
    defaultChecked?: boolean;
    /** Fires whenever the checked state changes (both controlled and uncontrolled). */
    onCheckedChange?: (checked: boolean) => void;
    /** Visual size. `default` is 32×20 with a 16px thumb; `sm` is 24×16 with a 12px thumb. */
    size?: 'sm' | 'default';
}

/**
 * Custom Switch primitive — independently controllable, no radix dependency.
 * Renders as a native `<button role="switch">` so screen readers and keyboard
 * activation (Enter/Space) work out of the box. The state lives in `data-state`
 * (`checked` | `unchecked`) so the stylesheet can react without reading `aria-`
 * attributes.
 */
export const Switch: FC<SwitchProps> = ({
    checked: controlledChecked,
    defaultChecked = false,
    onCheckedChange,
    disabled,
    size = 'default',
    className,
    onClick,
    ...rest
}) => {
    const [uncontrolledChecked, setUncontrolledChecked] = useState(defaultChecked);
    const isControlled = controlledChecked !== undefined;
    const checked = isControlled ? controlledChecked : uncontrolledChecked;

    const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
        const next = !checked;
        if (!isControlled) setUncontrolledChecked(next);
        onCheckedChange?.(next);
        onClick?.(event);
    };

    const state = checked ? 'checked' : 'unchecked';

    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            data-state={state}
            data-disabled={disabled ? '' : undefined}
            data-size={size}
            disabled={disabled}
            onClick={handleClick}
            className={clsx(styles.root, className)}
            {...rest}
        >
            <span className={styles.thumb} data-state={state} />
        </button>
    );
};
