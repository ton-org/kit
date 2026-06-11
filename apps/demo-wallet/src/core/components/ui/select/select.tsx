/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

import { cn } from '@/lib/utils';

function Select(props: React.ComponentProps<typeof SelectPrimitive.Root>) {
    return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup(props: React.ComponentProps<typeof SelectPrimitive.Group>) {
    return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue(props: React.ComponentProps<typeof SelectPrimitive.Value>) {
    return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
    return (
        <SelectPrimitive.Trigger
            data-slot="select-trigger"
            className={cn(
                'flex w-fit items-center justify-between gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-900 whitespace-nowrap transition-colors outline-none select-none hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-gray-400 [&_svg]:pointer-events-none [&_svg]:shrink-0',
                className,
            )}
            {...props}
        >
            {children}
            <SelectPrimitive.Icon asChild>
                <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
            </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
    );
}

function SelectContent({
    className,
    children,
    position = 'popper',
    sideOffset = 4,
    ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
    return (
        <SelectPrimitive.Portal>
            <SelectPrimitive.Content
                data-slot="select-content"
                position={position}
                sideOffset={sideOffset}
                className={cn(
                    'relative z-50 max-h-[var(--radix-select-content-available-height)] min-w-[var(--radix-select-trigger-width)] overflow-x-hidden overflow-y-auto rounded-lg border border-gray-200 bg-white text-gray-900 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95',
                    position === 'popper' &&
                        'data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1',
                    className,
                )}
                {...props}
            >
                <SelectScrollUpButton />
                <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
                <SelectScrollDownButton />
            </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
    );
}

function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Label>) {
    return (
        <SelectPrimitive.Label
            data-slot="select-label"
            className={cn('px-2 py-1 text-[11px] font-medium text-gray-400', className)}
            {...props}
        />
    );
}

function SelectItem({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) {
    return (
        <SelectPrimitive.Item
            data-slot="select-item"
            className={cn(
                'relative flex w-full cursor-pointer items-center gap-1.5 rounded-md py-1.5 pr-8 pl-2 text-xs text-gray-900 outline-none select-none focus:bg-gray-100 data-[highlighted]:bg-gray-100 data-[state=checked]:font-semibold data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                className,
            )}
            {...props}
        >
            <span className="pointer-events-none absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                <SelectPrimitive.ItemIndicator>
                    <Check className="h-3.5 w-3.5 text-blue-500" />
                </SelectPrimitive.ItemIndicator>
            </span>
            <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
        </SelectPrimitive.Item>
    );
}

function SelectSeparator({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Separator>) {
    return (
        <SelectPrimitive.Separator
            data-slot="select-separator"
            className={cn('pointer-events-none -mx-1 my-1 h-px bg-gray-200', className)}
            {...props}
        />
    );
}

function SelectScrollUpButton(props: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
    return (
        <SelectPrimitive.ScrollUpButton
            data-slot="select-scroll-up-button"
            className="flex cursor-default items-center justify-center bg-white py-1 text-gray-400"
            {...props}
        >
            <ChevronUp className="h-3.5 w-3.5" />
        </SelectPrimitive.ScrollUpButton>
    );
}

function SelectScrollDownButton(props: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
    return (
        <SelectPrimitive.ScrollDownButton
            data-slot="select-scroll-down-button"
            className="flex cursor-default items-center justify-center bg-white py-1 text-gray-400"
            {...props}
        >
            <ChevronDown className="h-3.5 w-3.5" />
        </SelectPrimitive.ScrollDownButton>
    );
}

export {
    Select,
    SelectGroup,
    SelectValue,
    SelectTrigger,
    SelectContent,
    SelectLabel,
    SelectItem,
    SelectSeparator,
    SelectScrollUpButton,
    SelectScrollDownButton,
};
