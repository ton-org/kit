/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type React from 'react';
import { Network } from '@ton/appkit';
import { SwapWidget } from '@ton/appkit-react';
import type { AppkitUIToken } from '@ton/appkit-react';

import { Layout } from '@/core/components';
import { USDT_MASTER_MAINNET } from '@/core/constants/tokens';

const TOKENS: AppkitUIToken[] = [
    {
        id: 'ton',
        symbol: 'TON',
        name: 'Toncoin',
        decimals: 9,
        address: 'ton',
        network: Network.mainnet(),
        logo: './tokens/ton.png',
    },
    {
        id: 'usdt',
        symbol: 'USD₮',
        name: 'Tether USD',
        decimals: 6,
        address: USDT_MASTER_MAINNET,
        network: Network.mainnet(),
        rate: '1',
        logo: `./tokens/usdt.png`,
    },
    {
        id: 'ston',
        symbol: 'STON',
        name: 'STON',
        decimals: 9,
        address: 'EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO',
        network: Network.mainnet(),
        logo: './tokens/ston.png',
    },
    {
        id: 'xaut',
        symbol: 'XAUt0',
        name: 'Tether Gold',
        decimals: 6,
        address: 'EQA1R_LuQCLHlMgOo1S4G7Y7W1cd0FrAkbA10Zq7rddKxi9k',
        network: Network.mainnet(),
        logo: './tokens/xaut0.png',
    },
    {
        id: 'usde',
        symbol: 'USDe',
        name: 'Ethena USDe',
        decimals: 6,
        address: 'EQAIb6KmdfdDR7CN1GBqVJuP25iCnLKCvBlJ07Evuu2dzP5f',
        network: Network.mainnet(),
        rate: '1',
        logo: './tokens/usde.png',
    },
    {
        id: 'tston',
        symbol: 'tsTON',
        name: 'Tonstakers TON',
        decimals: 9,
        address: 'EQC98_qAmNEptUtPc7W6xdHh_ZHrBUFpw5Ft_IzNU20QAJav',
        network: Network.mainnet(),
        logo: './tokens/tston.svg',
    },
    {
        id: 'gemston',
        symbol: 'GEMSTON',
        name: 'GEMSTON',
        decimals: 9,
        address: 'EQBX6K9aXVl3nXINCyPPL86C4ONVmQ8vK360u6dykFKXpHCa',
        network: Network.mainnet(),
        logo: './tokens/gemston.png',
    },
    {
        id: 'utya',
        symbol: 'UTYA',
        name: 'Utya',
        decimals: 9,
        address: 'EQBaCgUwOoc6gHCNln_oJzb0mVs79YG7wYoavh-o1ItaneLA',
        network: Network.mainnet(),
        logo: './tokens/utya.png',
    },
    {
        id: 'weth',
        symbol: 'WETH',
        name: 'Wrapped Ether',
        decimals: 18,
        address: 'EQBTkLAhEteZCRgRe_xMs5ZE0bMrduYxKbyzGCpXXW8dRWOT',
        network: Network.mainnet(),
        logo: './tokens/weth.png',
    },
];

export const SwapPage: React.FC = () => {
    return (
        <Layout title={<span className="hidden md:block">Swap</span>}>
            <div className="w-fit mx-auto pt-3 flex justify-center items-center">
                <SwapWidget
                    tokens={TOKENS}
                    network={Network.mainnet()}
                    fiatSymbol="$"
                    defaultFromSymbol="TON"
                    defaultToSymbol="USDT"
                />
            </div>
        </Layout>
    );
};
