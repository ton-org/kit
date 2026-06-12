/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTonConnect } from '@demo/wallet-core';

import { LoaderCircle } from '@/core/components/ui/loader-circle';
import { createComponentLogger } from '@/core/lib/logger';
import { CenteredScreen } from '@/core/components/shared/centered-screen';

const log = createComponentLogger('TonConnectRoute');

export const TonConnectRoute: React.FC = () => {
    const navigate = useNavigate();
    const { handleTonConnectUrl } = useTonConnect();
    const hasHandled = useRef(false);

    useEffect(() => {
        if (hasHandled.current) return;
        hasHandled.current = true;

        const url = window.location.href;
        handleTonConnectUrl(url)
            .catch((err) => log.error('Failed to handle TON Connect URL:', err))
            .finally(() => navigate('/wallet', { replace: true }));
    }, [handleTonConnectUrl, navigate]);

    return (
        <CenteredScreen>
            <div className="flex flex-col items-center gap-4 px-4 text-center">
                <LoaderCircle size="lg" className="text-blue-500" />
                <p className="text-base font-medium text-gray-500">Connecting…</p>
            </div>
        </CenteredScreen>
    );
};
