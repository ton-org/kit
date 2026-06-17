/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';

import { Input } from '@/core/components/ui/input';

interface RecipientFieldProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
    /** When provided, renders a "Use my address" shortcut in the header. */
    onUseMyAddress?: () => void;
}

/** Recipient address field with an optional "Use my address" shortcut and inline validation. */
export const RecipientField: React.FC<RecipientFieldProps> = ({ value, onChange, error, onUseMyAddress }) => (
    <Input.Container error={Boolean(error)}>
        <Input.Header>
            <Input.Title>Recipient</Input.Title>
            {onUseMyAddress && (
                <button
                    type="button"
                    onClick={onUseMyAddress}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                    data-testid="use-my-address"
                >
                    Use my address
                </button>
            )}
        </Input.Header>
        <Input.Field>
            <Input.Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="EQ…"
                data-testid="recipient-input"
            />
        </Input.Field>
        {error && <Input.Caption>{error}</Input.Caption>}
    </Input.Container>
);
