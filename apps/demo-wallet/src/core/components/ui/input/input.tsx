/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { createContext, useContext, useMemo } from 'react';
import type { FC, ReactNode, ComponentProps, ChangeEvent } from 'react';

import { useInputResize } from './use-input-resize';
import type { InputSize } from './use-input-resize';

import { cn } from '@/core/lib/utils';

type InputVariant = 'default' | 'unstyled';

const SIZE_FONT: Record<InputSize, string> = {
    s: 'text-sm',
    m: 'text-base',
    l: 'text-xl',
};

interface InputContextProps {
    size: InputSize;
    variant: InputVariant;
    disabled?: boolean;
    error?: boolean;
    loading?: boolean;
    resizable?: boolean;
}

const InputContext = createContext<InputContextProps | undefined>(undefined);

const useInputContext = (): InputContextProps => {
    const context = useContext(InputContext);
    if (!context) {
        throw new Error('Input components must be used within an Input.Container');
    }
    return context;
};

export interface InputContainerProps extends ComponentProps<'div'> {
    size?: InputSize;
    variant?: InputVariant;
    disabled?: boolean;
    error?: boolean;
    loading?: boolean;
    resizable?: boolean;
    children: ReactNode;
}

const Container: FC<InputContainerProps> = ({
    size = 'm',
    variant = 'default',
    disabled,
    error,
    loading,
    resizable,
    className,
    children,
    ...props
}) => {
    const contextValue = useMemo(
        () => ({ size, variant, disabled, error, loading, resizable }),
        [size, variant, disabled, error, loading, resizable],
    );

    return (
        <InputContext.Provider value={contextValue}>
            <div
                className={cn('flex w-full flex-col gap-1', disabled && 'pointer-events-none opacity-50', className)}
                {...props}
            >
                {children}
            </div>
        </InputContext.Provider>
    );
};

const Header: FC<ComponentProps<'div'>> = ({ className, children, ...props }) => (
    <div className={cn('flex items-center justify-between px-1', className)} {...props}>
        {children}
    </div>
);

const Title: FC<ComponentProps<'span'>> = ({ className, children, ...props }) => (
    <span className={cn('text-sm font-medium text-gray-500', className)} {...props}>
        {children}
    </span>
);

const Field: FC<ComponentProps<'div'>> = ({ className, children, ...props }) => {
    const { variant, error } = useInputContext();
    return (
        <div
            className={cn(
                'relative flex items-center gap-2 overflow-hidden transition-colors',
                variant === 'default' &&
                    'rounded-2xl border-2 border-transparent bg-gray-100 p-3.5 focus-within:border-blue-500',
                variant === 'default' && error && 'border-red-500',
                className,
            )}
            {...props}
        >
            {children}
        </div>
    );
};

export interface InputSlotProps extends ComponentProps<'div'> {
    side?: 'left' | 'right';
}

const Slot: FC<InputSlotProps> = ({ className, children, ...props }) => (
    <div className={cn('flex flex-shrink-0 items-center justify-center', className)} {...props}>
        {children}
    </div>
);

const InputControl: FC<ComponentProps<'input'>> = ({ className, disabled: propsDisabled, onChange, ...props }) => {
    const { size, disabled: contextDisabled, loading, resizable } = useInputContext();
    const disabled = propsDisabled || contextDisabled;

    const { inputRef, measureMaxRef, measureMinRef, resizeStyle, adjustSize } = useInputResize({
        resizable,
        contextSize: size,
        value: props.value,
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
        onChange?.(e);
        adjustSize();
    };

    const text = String(props.value ?? props.defaultValue ?? '');

    if (loading) {
        return (
            <div className={cn('flex-1', SIZE_FONT[size])}>
                <div className="h-[1em] w-16 animate-pulse rounded bg-gray-200" />
            </div>
        );
    }

    return (
        <>
            {resizable && (
                <>
                    <span
                        ref={measureMaxRef}
                        className={cn('invisible absolute whitespace-pre', SIZE_FONT[size])}
                        aria-hidden
                    >
                        {text}
                    </span>
                    <span
                        ref={measureMinRef}
                        className={cn('invisible absolute whitespace-pre', SIZE_FONT.s)}
                        aria-hidden
                    />
                </>
            )}
            <input
                className={cn(
                    'w-full min-w-0 flex-1 border-0 bg-transparent p-0 text-gray-900 outline-none placeholder:text-gray-400',
                    SIZE_FONT[size],
                    className,
                )}
                style={resizeStyle}
                disabled={disabled}
                {...props}
                ref={inputRef}
                onChange={handleChange}
            />
        </>
    );
};

const Caption: FC<ComponentProps<'span'>> = ({ className, children, ...props }) => {
    const { error } = useInputContext();
    return (
        <span className={cn('px-1 text-xs', error ? 'text-red-500' : 'text-gray-500', className)} {...props}>
            {children}
        </span>
    );
};

export const Input = Object.assign(Container, {
    Container,
    Header,
    Title,
    Field,
    Slot,
    Input: InputControl,
    Caption,
});
