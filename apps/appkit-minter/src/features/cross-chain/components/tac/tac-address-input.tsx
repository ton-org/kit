/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { Button, Input } from '@ton/appkit-react';
import { toast } from 'sonner';

export const isTacAddressValid = (address: string) => !address || /^0x[a-fA-F0-9]{40}$/.test(address);

interface TacAddressInputProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    name?: string;
    placeholder?: string;
    className?: string;
}

export const TacAddressInput: React.FC<TacAddressInputProps> = ({
    value,
    onChange,
    label = 'Target TAC Wallet',
    name = 'tac-address-input',
    placeholder = '0x...',
    className,
}) => {
    const isValid = isTacAddressValid(value);

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            onChange(text.trim());
        } catch {
            toast.error('Failed to read from clipboard');
        }
    };

    return (
        <Input.Container error={!isValid && value !== ''} className={className}>
            <Input.Header>
                <Input.Title>{label}</Input.Title>
            </Input.Header>
            <Input.Field>
                <div className="w-full flex gap-2">
                    <Input.Input
                        name={name}
                        className="text-base! font-mono!"
                        value={value}
                        onChange={(e) => onChange((e.target as HTMLInputElement).value)}
                        placeholder={placeholder}
                    />
                    <Button variant="ghost" size="s" onClick={handlePaste}>
                        PASTE
                    </Button>
                </div>
            </Input.Field>
            {!isValid && value !== '' && <Input.Caption>Invalid EVM address</Input.Caption>}
        </Input.Container>
    );
};
