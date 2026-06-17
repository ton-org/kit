/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type React from 'react';
import { CryptoOnrampWidget } from '@ton/appkit-react';
import type { CryptoOnrampDestinationRef, CryptoOnrampSourceRef } from '@ton/appkit-react';
import { Caip2ByNetwork } from '@ton/appkit-react';

import { Layout } from '@/core/components';

const DEFAULT_DESTINATION: CryptoOnrampDestinationRef = {
    address: 'ton',
};

const DEFAULT_SOURCE: CryptoOnrampSourceRef = {
    chain: Caip2ByNetwork.ArbitrumMainnet,
    address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
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
