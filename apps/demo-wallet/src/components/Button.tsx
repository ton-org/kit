/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';

import { LoaderCircle } from './LoaderCircle';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    children,
    disabled,
    className = '',
    ...props
}) => {
    const baseClasses =
        'font-medium rounded-2xl transition-transform duration-[80ms] ease-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer enabled:hover:scale-[1.02] enabled:active:scale-[0.98]';

    const variantClasses = {
        primary: 'bg-[#007AFF] text-white',
        secondary: 'bg-gray-200 text-gray-900',
        danger: 'bg-red-600 text-white',
    };

    const sizeClasses = {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-3.5 text-base',
        lg: 'px-6 py-3 text-lg',
    };

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <>
                    <LoaderCircle size="sm" className="-ml-1 mr-2" />
                    Loading...
                </>
            ) : (
                children
            )}
        </button>
    );
};
