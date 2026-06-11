/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { DashboardActionButton } from './DashboardActionButton';
import { ReceiveModal } from './ReceiveModal';

import { SwapIcon, ReceiveIcon, SendIcon } from '@/core/components/ui/icons';

export const DashboardActions: React.FC = () => {
    const navigate = useNavigate();
    const [isReceiveOpen, setIsReceiveOpen] = useState(false);

    return (
        <>
            <div className="flex items-stretch gap-2">
                <DashboardActionButton
                    icon={<SwapIcon className="w-6 h-6" />}
                    label="Swap"
                    onClick={() => navigate('/swap')}
                />
                <DashboardActionButton
                    icon={<SendIcon className="w-6 h-6" />}
                    label="Send"
                    onClick={() => navigate('/send')}
                />
                <DashboardActionButton
                    icon={<ReceiveIcon className="w-6 h-6" />}
                    label="Receive"
                    onClick={() => setIsReceiveOpen(true)}
                />
            </div>

            <ReceiveModal isOpen={isReceiveOpen} onClose={() => setIsReceiveOpen(false)} />
        </>
    );
};
