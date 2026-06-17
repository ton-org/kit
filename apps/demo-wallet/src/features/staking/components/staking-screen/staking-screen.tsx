/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { FC } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaking, useWallet } from '@demo/wallet-core';

import { StakingInterface } from '../staking-interface';

import { NewLayout } from '@/core/components/shared/new-layout';
import { ScreenHeader } from '@/core/components/shared/screen-header';

export const Staking: FC = () => {
    const navigate = useNavigate();
    const { address } = useWallet();
    const { clearStaking, loadStakingData } = useStaking();

    useEffect(() => {
        if (address) {
            loadStakingData(address);
        }
        return () => clearStaking();
    }, [address, loadStakingData, clearStaking]);

    return (
        <NewLayout header={<ScreenHeader title="Stake" onBack={() => navigate('/wallet')} />}>
            <StakingInterface />
        </NewLayout>
    );
};
