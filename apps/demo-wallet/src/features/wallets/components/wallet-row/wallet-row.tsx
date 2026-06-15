/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState } from 'react';
import { Check, Copy, MoreHorizontal, Pencil, Trash2, Wallet, X } from 'lucide-react';
import { toast } from 'sonner';
import { getNetworkLabel } from '@demo/wallet-core';
import type { SavedWallet } from '@demo/wallet-core';

import { Popover, PopoverContent, PopoverTrigger } from '@/core/components/ui/popover';
import { shortenAddress } from '@/core/utils';

const networkBadgeClass = (network: SavedWallet['network']): string => {
    if (network === 'mainnet') return 'bg-green-100 text-green-800';
    if (network === 'tetra') return 'bg-purple-100 text-purple-800';
    return 'bg-blue-100 text-blue-800';
};

const handleCopy = async (address: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
        await navigator.clipboard.writeText(address);
        toast.success('Address copied');
    } catch {
        toast.error('Failed to copy address');
    }
};

interface WalletRowProps {
    wallet: SavedWallet;
    isActive: boolean;
    onSelect: () => void;
    /** Omit both to render a select-only row (no "⋯" management menu). */
    onRename?: (id: string, name: string) => void;
    onRemove?: (id: string) => void;
}

export const WalletRow: React.FC<WalletRowProps> = ({ wallet, isActive, onSelect, onRename, onRemove }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [draftName, setDraftName] = useState(wallet.name);

    const hasActions = Boolean(onRename || onRemove);

    const startRename = () => {
        setDraftName(wallet.name);
        setIsEditing(true);
        setMenuOpen(false);
    };

    const saveRename = () => {
        const next = draftName.trim();
        if (next && next !== wallet.name) onRename?.(wallet.id, next);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="flex items-center gap-3 px-2 py-3">
                <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Wallet className="w-5 h-5 text-gray-500" strokeWidth={1.8} />
                </div>
                <input
                    autoFocus
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') saveRename();
                        if (e.key === 'Escape') setIsEditing(false);
                    }}
                    className="flex-1 min-w-0 text-base font-bold text-gray-900 bg-gray-50 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="button"
                    onClick={saveRename}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-green-600 hover:bg-green-50 flex-shrink-0"
                    aria-label="Save name"
                >
                    <Check className="w-5 h-5" />
                </button>
                <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 flex-shrink-0"
                    aria-label="Cancel"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        );
    }

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onSelect}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect();
                }
            }}
            className={`flex items-center gap-3 px-2 py-3 rounded-2xl cursor-pointer transition-colors ${
                isActive ? 'bg-gray-50' : 'hover:bg-gray-50'
            }`}
        >
            <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Wallet className="w-5 h-5 text-gray-500" strokeWidth={1.8} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base font-bold text-gray-900 truncate">{wallet.name}</span>
                    <span
                        className={`px-1.5 py-0.5 text-[10px] font-medium rounded flex-shrink-0 ${networkBadgeClass(wallet.network)}`}
                    >
                        {getNetworkLabel(wallet.network)}
                    </span>
                </div>
                <button
                    type="button"
                    onClick={(e) => handleCopy(wallet.address, e)}
                    className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors max-w-full"
                    aria-label="Copy address"
                >
                    <span className="font-mono truncate">{shortenAddress(wallet.address, 6)}</span>
                    <Copy className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2} />
                </button>
            </div>

            {hasActions && (
                <Popover
                    open={menuOpen}
                    onOpenChange={(open) => {
                        setMenuOpen(open);
                        if (!open) setConfirmingDelete(false);
                    }}
                >
                    <PopoverTrigger asChild>
                        <button
                            type="button"
                            onClick={(e) => e.stopPropagation()}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0"
                            aria-label="More actions"
                        >
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent align="end" side="bottom" className="w-44 p-1" onClick={(e) => e.stopPropagation()}>
                        {confirmingDelete ? (
                            <div className="p-2">
                                <p className="text-xs text-gray-500 mb-2">Delete this wallet? This can’t be undone.</p>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setConfirmingDelete(false)}
                                        className="flex-1 text-sm font-medium text-gray-700 rounded-lg py-1.5 hover:bg-gray-100"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMenuOpen(false);
                                            onRemove?.(wallet.id);
                                        }}
                                        className="flex-1 text-sm font-semibold text-white bg-red-500 rounded-lg py-1.5 hover:bg-red-600"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {onRename && (
                                    <button
                                        type="button"
                                        onClick={startRename}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-900 rounded-lg hover:bg-gray-100"
                                    >
                                        <Pencil className="w-4 h-4 text-gray-500" />
                                        Rename
                                    </button>
                                )}
                                {onRemove && (
                                    <button
                                        type="button"
                                        onClick={() => setConfirmingDelete(true)}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                )}
                            </>
                        )}
                    </PopoverContent>
                </Popover>
            )}
        </div>
    );
};
