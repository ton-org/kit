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
import { useSwap } from '@demo/wallet-core';

import { SwapInterface } from '../swap-interface';
import { USDT_ADDRESS } from '../../constants/swap';

import { NewLayout } from '@/core/components/shared/new-layout';
import { ScreenHeader } from '@/core/components/shared/screen-header';

export const Swap: FC = () => {
    const navigate = useNavigate();
    const { setFromToken, setToToken, clearSwap } = useSwap();

    useEffect(() => {
        setFromToken({ address: 'ton', decimals: 9, symbol: 'GRAM' });
        setToToken({ address: USDT_ADDRESS, decimals: 6, symbol: 'USDT' });

        return () => clearSwap();
    }, []);

    return (
        <NewLayout header={<ScreenHeader title="Swap" onBack={() => navigate('/wallet')} />}>
            <SwapInterface />
        </NewLayout>
    );
};
