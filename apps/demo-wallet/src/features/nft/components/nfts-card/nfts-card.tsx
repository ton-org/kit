/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNfts } from '@demo/wallet-core';

import { NftTile } from '../nft-tile';

/** Dashboard NFTs preview: a horizontal-scroll strip; renders nothing when the wallet has no NFTs. */
export const NftsCard: React.FC = () => {
    const navigate = useNavigate();
    const { userNfts, formatNftIndex } = useNfts();

    if (userNfts.length === 0) {
        return null;
    }

    return (
        <section>
            <button
                type="button"
                onClick={() => navigate('/wallet/nft')}
                className="flex items-center gap-1 mb-2"
                aria-label="View all NFTs"
            >
                <h2 className="text-base font-semibold text-gray-900">NFTs</h2>
                <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            <div className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-1 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
                {userNfts.map((nft) => (
                    <div key={nft.address} className="w-36 flex-shrink-0">
                        <NftTile nft={nft} formatNftIndex={formatNftIndex} />
                    </div>
                ))}
            </div>
        </section>
    );
};
