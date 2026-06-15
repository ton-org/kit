/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';

import type { UseGaslessJettonSendResult } from '../../hooks/use-gasless-jetton-send';

import { Select, SelectContent, SelectItem, SelectTrigger } from '@/core/components/ui/select';
import { useJettonInfo } from '@/features/jettons';

/** Resolves a fee-asset's ticker, falling back to a short address. */
const useFeeAssetLabel = (address: string): string => {
    const info = useJettonInfo(address);
    return info?.symbol || `${address.slice(0, 4)}…${address.slice(-4)}`;
};

const FeeAssetLabel: React.FC<{ address: string }> = ({ address }) => <>{useFeeAssetLabel(address)}</>;

const FeeAssetOption: React.FC<{ address: string }> = ({ address }) => (
    <SelectItem value={address} className="text-sm">
        {useFeeAssetLabel(address)}
    </SelectItem>
);

interface GaslessOptionsProps {
    gasless: UseGaslessJettonSendResult;
}

/** Optional gasless block: the toggle, a fee-asset picker, and the resolved gas fee. */
export const GaslessOptions: React.FC<GaslessOptionsProps> = ({ gasless }) => {
    if (!gasless.canUse) return null;

    return (
        <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                    type="checkbox"
                    checked={gasless.enabled}
                    onChange={(e) => gasless.setEnabled(e.target.checked)}
                    data-testid="gasless-toggle"
                />
                <span>Gasless — pay the fee in a jetton</span>
            </label>

            {gasless.effective && (
                <>
                    <div className="space-y-1">
                        <span className="block px-1 text-xs text-gray-500">Fee asset</span>
                        <Select
                            value={gasless.feeAsset ?? ''}
                            onValueChange={gasless.setFeeAsset}
                            disabled={gasless.supportedAssets.length === 0}
                        >
                            <SelectTrigger
                                className="w-full rounded-2xl border-2 border-transparent bg-gray-100 p-3.5 text-base font-medium text-gray-900 hover:bg-gray-100 focus-visible:border-blue-500 focus-visible:ring-0 data-[state=open]:border-blue-500"
                                data-testid="gasless-fee-asset"
                            >
                                {gasless.feeAsset ? (
                                    <FeeAssetLabel address={gasless.feeAsset} />
                                ) : (
                                    <span className="text-gray-400">Select</span>
                                )}
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {gasless.supportedAssets.map((asset) => (
                                    <FeeAssetOption key={asset.address} address={asset.address} />
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Gas fee</span>
                        <span className="font-medium text-gray-900">
                            {gasless.error ? '—' : gasless.isQuoting ? 'Calculating…' : (gasless.feeFormatted ?? '—')}
                        </span>
                    </div>
                    {gasless.error && (
                        <p className="text-xs text-red-500" data-testid="gasless-error">
                            {gasless.error}
                        </p>
                    )}
                </>
            )}
        </div>
    );
};
