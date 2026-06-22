/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

import { cn } from '@/core/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'gray' | 'danger' | 'ghost';
export type ButtonSize = 'lg' | 'md' | 'sm' | 'icon';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    loading?: boolean;
    /** Optional leading icon rendered before children. */
    icon?: ReactNode;
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
    primary: 'bg-[#007AFF] text-white disabled:bg-gray-100 disabled:text-gray-400',
    secondary: 'bg-gray-200 text-gray-900 disabled:opacity-60',
    gray: 'bg-gray-100 text-gray-900 disabled:opacity-50',
    danger: 'bg-red-500 text-white disabled:opacity-60',
    ghost: 'bg-transparent text-gray-400 disabled:opacity-50',
};

const SIZE_CLASS: Record<ButtonSize, string> = {
    lg: 'px-5 py-3.5 text-base font-bold rounded-2xl',
    md: 'px-4 py-3.5 text-sm font-semibold rounded-xl',
    sm: 'px-4 py-2 text-sm font-semibold rounded-full',
    icon: 'h-9 w-9 rounded-full',
};

/**
 * Variant-based action button. Visual language is driven by `variant` + `size`;
 * disabled/loading plumbing and icon rendering are handled here.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = 'primary',
            size = 'lg',
            fullWidth = false,
            loading = false,
            disabled,
            icon,
            children,
            type,
            ...props
        },
        ref,
    ) => (
        <button
            ref={ref}
            type={type ?? 'button'}
            disabled={disabled || loading}
            className={cn(
                'inline-flex items-center justify-center gap-2 transition-transform duration-[180ms] ease-out enabled:active:duration-[80ms] touch-manipulation select-none [-webkit-tap-highlight-color:transparent] focus:outline-none disabled:cursor-not-allowed enabled:hover:scale-[1.015] enabled:active:scale-[0.995]',
                VARIANT_CLASS[variant],
                SIZE_CLASS[size],
                fullWidth && 'w-full',
                className,
            )}
            {...props}
        >
            {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
                <>
                    {icon}
                    {children}
                </>
            )}
        </button>
    ),
);

Button.displayName = 'Button';
