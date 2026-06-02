/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type React from 'react';

import { Layout } from '@/core/components';
import { BridgeToTacChain } from '@/features/cross-chain';

export const BridgeToTacPage: React.FC = () => {
    return (
        <Layout title="Bridge to TAC">
            <BridgeToTacChain />
        </Layout>
    );
};
