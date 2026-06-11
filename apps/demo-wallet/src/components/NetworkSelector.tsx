/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import type { NetworkType } from '@demo/wallet-core';

import { Segmented } from '@/core/components/ui/segmented';
import type { SegmentedOption } from '@/core/components/ui/segmented';

interface NetworkSelectorProps {
    value: NetworkType;
    onChange: (network: NetworkType) => void;
    label?: string;
    compact?: boolean;
}

const COMPACT_OPTIONS: SegmentedOption<NetworkType>[] = [
    { value: 'mainnet', label: 'Mainnet', testId: 'network-select-mainnet' },
    { value: 'testnet', label: 'Testnet', testId: 'network-select-testnet' },
    { value: 'tetra', label: 'Tetra', testId: 'network-select-tetra' },
];

export const NetworkSelector: React.FC<NetworkSelectorProps> = ({
    value,
    onChange,
    label = 'Network',
    compact = false,
}) => {
    if (compact) {
        return (
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                <Segmented value={value} onChange={onChange} options={COMPACT_OPTIONS} />
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <div className="grid grid-cols-3 gap-3">
                <button
                    type="button"
                    data-testid="network-select-mainnet"
                    onClick={() => onChange('mainnet')}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all border-2 ${
                        value === 'mainnet'
                            ? 'bg-blue-50 text-blue-700 border-blue-500'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}
                >
                    <div className="flex flex-col items-center space-y-1">
                        <span className="font-semibold">Mainnet</span>
                        <span className="text-xs text-gray-500">Real transactions</span>
                    </div>
                </button>
                <button
                    type="button"
                    data-testid="network-select-testnet"
                    onClick={() => onChange('testnet')}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all border-2 ${
                        value === 'testnet'
                            ? 'bg-blue-50 text-blue-700 border-blue-500'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}
                >
                    <div className="flex flex-col items-center space-y-1">
                        <span className="font-semibold">Testnet</span>
                        <span className="text-xs text-gray-500">For development</span>
                    </div>
                </button>
                <button
                    type="button"
                    data-testid="network-select-tetra"
                    onClick={() => onChange('tetra')}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all border-2 ${
                        value === 'tetra'
                            ? 'bg-blue-50 text-blue-700 border-blue-500'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}
                >
                    <div className="flex flex-col items-center space-y-1">
                        <span className="font-semibold">Tetra</span>
                        <span className="text-xs text-gray-500">Tetra network</span>
                    </div>
                </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
                {value === 'mainnet'
                    ? 'Use mainnet for real transactions with real TON.'
                    : value === 'testnet'
                      ? 'Use testnet for development and testing with test TON.'
                      : 'Use Tetra network for Tetra transactions.'}
            </p>
        </div>
    );
};
