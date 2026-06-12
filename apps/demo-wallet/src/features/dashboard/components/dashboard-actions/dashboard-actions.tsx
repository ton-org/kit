/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';

import { DashboardActionButton } from '../dashboard-action-button';

import { SwapIcon, SendIcon, StakeIcon } from '@/core/components/ui/icons';

export const DashboardActions: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex items-stretch gap-2">
            <DashboardActionButton
                icon={<SendIcon className="w-6 h-6" />}
                label="Send"
                onClick={() => navigate('/send')}
                testId="send-button"
            />
            <DashboardActionButton
                icon={<SwapIcon className="w-6 h-6" />}
                label="Swap"
                onClick={() => navigate('/swap')}
                testId="swap-button"
            />
            <DashboardActionButton
                icon={<StakeIcon className="w-6 h-6" />}
                label="Stake"
                onClick={() => navigate('/staking')}
                testId="stake-button"
            />
        </div>
    );
};
