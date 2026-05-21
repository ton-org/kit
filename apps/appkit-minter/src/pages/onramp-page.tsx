/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type React from 'react';
import { CryptoOnrampWidget } from '@ton/appkit-react';
import type { CryptoOnrampDestinationCurrency, CryptoOnrampSourceCurrency } from '@ton/appkit-react';
import { Caip2ByNetwork } from '@ton/appkit-react';

import { Layout } from '@/core/components';

const DEFAULT_DESTINATION: CryptoOnrampDestinationCurrency = {
    address: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
    symbol: 'USDT',
    name: 'Tether',
    decimals: 6,
    logo: 'https://cdn.layerswap.io/layerswap/currencies/usdt.png',
};

const DEFAULT_SOURCE: CryptoOnrampSourceCurrency = {
    chain: Caip2ByNetwork.ArbitrumMainnet,
    address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
    symbol: 'USDT0',
    name: 'Tether USD0',
    decimals: 6,
    logo: 'https://cdn.layerswap.io/layerswap/currencies/usdt0.png',
};

export const CryptoOnrampPage: React.FC = () => {
    return (
        <Layout title="Crypto Onramp">
            <div className="w-full max-w-[434px] mx-auto flex justify-center items-center">
                <CryptoOnrampWidget defaultDestination={DEFAULT_DESTINATION} defaultSource={DEFAULT_SOURCE} />
            </div>
        </Layout>
    );
};
