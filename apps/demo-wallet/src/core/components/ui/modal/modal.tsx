/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import type { ComponentProps } from 'react';
import { ChevronLeft, X } from 'lucide-react';

import { Dialog, DialogContent, DialogTitle } from '../dialog';
import { Drawer, DrawerContent, DrawerTitle } from '../drawer';

import { Button } from '@/components/Button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/useMediaQuery';

export interface ModalContainerProps extends ComponentProps<'div'> {
    isOpened: boolean;
    onOpenChange: (value: boolean) => void;
}

export const ModalContainer: React.FC<ModalContainerProps> = ({
    isOpened,
    onOpenChange,
    children,
    className,
    ...props
}) => {
    const isMobile = useIsMobile();

    if (isMobile) {
        return (
            <Drawer open={isOpened} onOpenChange={onOpenChange}>
                <DrawerContent className={cn('max-w-md mx-auto', className)} aria-describedby={undefined} {...props}>
                    {children}
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Dialog open={isOpened} onOpenChange={onOpenChange}>
            <DialogContent
                className={cn('max-w-md rounded-2xl p-0 gap-0', className)}
                aria-describedby={undefined}
                {...props}
            >
                {children}
            </DialogContent>
        </Dialog>
    );
};

interface ModalHeaderProps extends ComponentProps<'div'> {
    onClose?: () => void;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({ onClose, children, className, ...props }) => (
    <div className={cn('flex items-center justify-between px-4 pt-3 pb-5 md:pt-5', className)} {...props}>
        <div className="flex items-center gap-2 min-w-0">{children}</div>
        {onClose && (
            <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors flex-shrink-0"
                aria-label="Close"
            >
                <X className="w-4 h-4" strokeWidth={2.5} />
            </button>
        )}
    </div>
);

export const ModalTitle: React.FC<ComponentProps<'h2'>> = ({ className, ...props }) => {
    const isMobile = useIsMobile();
    const Wrapper = isMobile ? DrawerTitle : DialogTitle;
    return <Wrapper className={cn('text-xl font-bold text-gray-900 truncate', className)} {...props} />;
};

export const ModalBody: React.FC<ComponentProps<'div'>> = ({ children, className, ...props }) => (
    <div className={cn('flex flex-col px-4 pb-6', className)} {...props}>
        {children}
    </div>
);

export const ModalFooter: React.FC<ComponentProps<'div'>> = ({ children, className, ...props }) => (
    <div className={cn('flex flex-col gap-2 px-4 pb-6', className)} {...props}>
        {children}
    </div>
);

export const ModalBackButton: React.FC<ComponentProps<'button'>> = ({ className, ...props }) => (
    <Button variant="secondary" className={cn('!px-2 gap-1 text-sm', className)} {...props}>
        <ChevronLeft className="h-4 w-4" />
        <span className="font-semibold">Back</span>
    </Button>
);

export const Modal = {
    Container: ModalContainer,
    Header: ModalHeader,
    Title: ModalTitle,
    Body: ModalBody,
    Footer: ModalFooter,
    BackButton: ModalBackButton,
};
