/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNfts } from '@demo/wallet-core';

import { NftTile } from '../nft-tile';

import { NewLayout } from '@/core/components/shared/new-layout';
import { ScreenHeader } from '@/core/components/shared/screen-header';

/** Full NFTs page: every NFT held by the active wallet, as a grid. */
export const NftsScreen: FC = () => {
    const navigate = useNavigate();
    const { userNfts, formatNftIndex } = useNfts();

    return (
        <NewLayout header={<ScreenHeader title="NFTs" onBack={() => navigate('/wallet')} />}>
            {userNfts.length === 0 ? (
                <p className="py-12 text-center text-sm text-gray-400">No NFTs yet</p>
            ) : (
                <div className="grid grid-cols-2 gap-3">
                    {userNfts.map((nft) => (
                        <NftTile key={nft.address} nft={nft} formatNftIndex={formatNftIndex} />
                    ))}
                </div>
            )}
        </NewLayout>
    );
};
