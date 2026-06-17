/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useEffect, useState } from 'react';

import { useSwapProviders } from '../../hooks/use-swap-providers';

import { Button } from '@/core/components/ui/button';
import { Modal } from '@/core/components/ui/modal';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/core/components/ui/select';
import { SettingsButton } from '@/core/components/shared/settings-button';
import { cn } from '@/core/lib/utils';

const PRESET_SLIPPAGES = [50, 100, 300, 500];

interface SwapSettingsProps {
    slippageBps: number;
    setSlippageBps: (slippage: number) => void;
    providerId: string;
    setProviderId: (providerId: string) => void;
}

/** Gear button that opens a modal to choose the slippage tolerance and swap provider. */
export const SwapSettings: React.FC<SwapSettingsProps> = ({
    slippageBps,
    setSlippageBps,
    providerId,
    setProviderId,
}) => {
    const providers = useSwapProviders();

    const [open, setOpen] = useState(false);
    const [tempSlippageBps, setTempSlippageBps] = useState(slippageBps);
    const [tempProviderId, setTempProviderId] = useState(providerId);

    useEffect(() => {
        if (open) {
            setTempSlippageBps(slippageBps);
            setTempProviderId(providerId);
        }
    }, [open, slippageBps, providerId]);

    const handleSave = () => {
        if (tempSlippageBps >= 10 && tempSlippageBps <= 5000) {
            setSlippageBps(tempSlippageBps);
        }
        if (tempProviderId !== providerId) {
            setProviderId(tempProviderId);
        }
        setOpen(false);
    };

    const selectedProviderName = providers.find((provider) => provider.id === tempProviderId)?.name;

    return (
        <>
            <SettingsButton onClick={() => setOpen(true)} aria-label="Swap settings" />

            <Modal.Container isOpened={open} onOpenChange={setOpen}>
                <Modal.Header onClose={() => setOpen(false)}>
                    <Modal.Title>Swap settings</Modal.Title>
                </Modal.Header>
                <Modal.Body className="gap-6">
                    <div className="space-y-3">
                        <span className="block text-sm font-medium text-gray-700">Slippage tolerance</span>
                        <div className="grid grid-cols-4 gap-2">
                            {PRESET_SLIPPAGES.map((preset) => (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() => setTempSlippageBps(preset)}
                                    className={cn(
                                        'rounded-xl border-2 py-2 text-sm font-semibold transition-colors',
                                        tempSlippageBps === preset
                                            ? 'border-blue-500 bg-blue-50 text-blue-600'
                                            : 'border-transparent bg-gray-100 text-gray-700 hover:bg-gray-200',
                                    )}
                                >
                                    {preset / 100}%
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500">
                            Your transaction will revert if the price changes unfavorably by more than this percentage.
                        </p>
                    </div>

                    {providers.length > 0 && (
                        <div className="space-y-2">
                            <span className="block text-sm font-medium text-gray-700">Provider</span>
                            <Select value={tempProviderId} onValueChange={setTempProviderId}>
                                <SelectTrigger className="w-full rounded-2xl border-2 border-transparent bg-gray-100 p-3.5 text-base font-medium capitalize text-gray-900 hover:bg-gray-100 focus-visible:border-blue-500 focus-visible:ring-0 data-[state=open]:border-blue-500">
                                    {selectedProviderName ? (
                                        <span className="capitalize">{selectedProviderName}</span>
                                    ) : (
                                        <span className="text-gray-400">Select provider</span>
                                    )}
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {providers.map((provider) => (
                                        <SelectItem
                                            key={provider.id}
                                            value={provider.id}
                                            className="text-sm capitalize"
                                        >
                                            {provider.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button fullWidth onClick={handleSave}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal.Container>
        </>
    );
};
