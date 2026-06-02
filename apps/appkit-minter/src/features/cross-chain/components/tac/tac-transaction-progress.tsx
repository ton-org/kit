/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { Button, useNetwork, Network } from '@ton/appkit-react';
import { useCrossChainTransactionStatus } from '@ton/appkit-react/cross-chain';
import { ExternalLink, Info, CheckCircle2, AlertCircle } from 'lucide-react';

import { cn } from '@/core/lib/utils';

interface TacTransactionProgressProps {
    trackingHash: string;
    onDismiss: () => void;
}

export const TacTransactionProgress: React.FC<TacTransactionProgressProps> = ({ trackingHash, onDismiss }) => {
    const network = useNetwork();
    const { data: trackData, isLoading: isTracking } = useCrossChainTransactionStatus({
        transactionHash: trackingHash,
        providerId: 'tac',
    });

    const status = trackData?.status;
    const totalMessages = trackData?.totalMessages || 0;
    const onchainMessages = trackData?.onchainMessages || 0;

    const getProgress = () => {
        if (status === 'completed') return 100;
        if (!trackData || totalMessages === 0) return 0;
        return (onchainMessages / totalMessages) * 100;
    };

    const getStatusColor = () => {
        if (status === 'failed') return 'text-red-500';
        if (status === 'completed') return 'text-green-500';
        return 'text-blue-500';
    };

    return (
        <div className="rounded-3xl bg-secondary p-5 border border-white/5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold flex items-center gap-2">
                    <Info size={16} className="text-blue-500" />
                    Transaction Status
                </h3>
                <button
                    onClick={onDismiss}
                    className="text-xs text-tertiary-foreground hover:text-foreground underline decoration-dotted underline-offset-4"
                >
                    Dismiss
                </button>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-0.5 overflow-hidden">
                        <span className="text-[10px] uppercase font-bold text-tertiary-foreground">TON tx hash</span>
                        <span className="text-xs font-mono truncate">{trackingHash}</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 flex-shrink-0"
                        onClick={() => {
                            const isTestnet = network?.chainId === Network.testnet().chainId;
                            const host = isTestnet ? 'testnet.tonviewer.com' : 'tonviewer.com';
                            window.open(`https://${host}/transaction/${trackingHash}`, '_blank');
                        }}
                    >
                        <ExternalLink size={14} />
                    </Button>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                        <span className="font-medium text-tertiary-foreground">Current Status</span>
                        <span className={cn('font-bold uppercase', getStatusColor())}>
                            {isTracking
                                ? 'Processing...'
                                : status === 'pending' && totalMessages > 0
                                  ? `Processing (${onchainMessages}/${totalMessages})`
                                  : status && status !== 'unknown'
                                    ? status
                                    : 'Pending'}
                        </span>
                    </div>
                    <div className="h-2 w-full bg-background rounded-full overflow-hidden p-0.5 border border-white/5">
                        <div
                            className={cn(
                                'h-full rounded-full transition-all duration-1000',
                                status === 'failed'
                                    ? 'bg-red-500'
                                    : status === 'completed'
                                      ? 'bg-green-500'
                                      : 'bg-blue-500',
                            )}
                            style={{ width: `${getProgress()}%` }}
                        />
                    </div>
                </div>

                {status === 'completed' && (
                    <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-xl border border-green-500/20 text-green-500">
                        <CheckCircle2 size={16} />
                        <span className="text-xs font-medium">Successfully sent to TAC!</span>
                    </div>
                )}

                {status === 'failed' && (
                    <div className="flex items-center gap-2 p-3 bg-red-500/10 rounded-xl border border-red-500/20 text-red-500">
                        <AlertCircle size={16} />
                        <span className="text-xs font-medium">Execution failed. Check explorer for details.</span>
                    </div>
                )}
            </div>
        </div>
    );
};
