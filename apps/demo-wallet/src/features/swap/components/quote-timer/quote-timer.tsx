/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { FC } from 'react';
import { useEffect, useState } from 'react';

import { Button } from '@/core/components/ui/button';

interface QuoteTimerProps {
    expiresAt?: number; // Unix timestamp in seconds
    onRefresh: () => void;
    loading?: boolean;
}

export const QuoteTimer: FC<QuoteTimerProps> = ({ expiresAt, onRefresh, loading = false }) => {
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (!expiresAt) {
            setTimeLeft(0);
            return;
        }

        const updateTimer = () => {
            const now = Math.floor(Date.now() / 1000); // Current time in seconds
            const remaining = Math.max(0, expiresAt - now);
            setTimeLeft(remaining * 1000); // Convert to milliseconds for display
        };

        updateTimer();
        const interval = setInterval(updateTimer, 100);

        return () => clearInterval(interval);
    }, [expiresAt]);

    const totalSeconds = Math.ceil(timeLeft / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const isExpired = !expiresAt || timeLeft === 0;

    if (!expiresAt) {
        return null;
    }

    if (isExpired) {
        return (
            <div className="flex items-center justify-between rounded-2xl bg-yellow-50 px-4 py-3">
                <span className="text-sm font-medium text-yellow-800">Quote expired</span>
                <Button onClick={onRefresh} disabled={loading} loading={loading} variant="secondary" size="sm">
                    Refresh
                </Button>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between rounded-2xl bg-blue-50 px-4 py-3">
            <span className="text-sm text-blue-800">
                Quote valid for{' '}
                <span className="font-semibold">
                    {minutes > 0 && `${minutes}m `}
                    {seconds}s
                </span>
            </span>
        </div>
    );
};
