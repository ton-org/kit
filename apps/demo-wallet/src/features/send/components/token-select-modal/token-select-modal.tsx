/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';

import type { TokenOption } from '../../types';

import { Modal } from '@/core/components/ui/modal';
import { AssetRow } from '@/features/assets';
import { cn } from '@/core/lib/utils';
import { formatRate } from '@/core/utils';

interface TokenSelectModalProps {
    isOpened: boolean;
    onOpenChange: (value: boolean) => void;
    options: TokenOption[];
    selectedId: string;
    onSelect: (option: TokenOption) => void;
}

/** Drawer/dialog token picker, reusing the assets-page row for visual parity. */
export const TokenSelectModal: React.FC<TokenSelectModalProps> = ({
    isOpened,
    onOpenChange,
    options,
    selectedId,
    onSelect,
}) => (
    <Modal.Container isOpened={isOpened} onOpenChange={onOpenChange}>
        <Modal.Header onClose={() => onOpenChange(false)}>
            <Modal.Title>Select token</Modal.Title>
        </Modal.Header>
        <Modal.Body className="max-h-[60vh] gap-1 overflow-y-auto">
            {options.map((option) => (
                <button
                    key={option.id}
                    type="button"
                    onClick={() => onSelect(option)}
                    className={cn(
                        'w-full rounded-2xl px-2 text-left transition-colors',
                        option.id === selectedId ? 'bg-blue-50' : 'hover:bg-gray-50',
                    )}
                >
                    <AssetRow
                        id={option.id}
                        icon={option.icon}
                        fallbackText={option.fallbackText}
                        name={option.name}
                        symbol={option.symbol}
                        amount={option.balance}
                        rateLabel={option.rate !== undefined ? formatRate(option.rate) : undefined}
                        fiat={option.rate !== undefined ? option.balance * option.rate : undefined}
                    />
                </button>
            ))}
        </Modal.Body>
    </Modal.Container>
);
