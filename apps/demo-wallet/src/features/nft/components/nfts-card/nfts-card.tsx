/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import type { NFT } from '@ton/walletkit';
import { ChevronRight } from 'lucide-react';
import { useNfts } from '@demo/wallet-core';

import { FallbackImage } from '@/core/components/ui/fallback-image';

const getNftImageSources = (nft: NFT): string[] => {
    const img = nft.info?.image;
    if (!img) return [];
    return [...img.urls, ...(img.data ? [`data:image/png;base64,${img.data}`] : [])];
};

const getNftName = (nft: NFT, formatNftIndex: (index: string) => string): string => {
    if (nft.info?.name) return nft.info.name;
    if (nft.index) return `NFT ${formatNftIndex(nft.index)}`;
    return 'NFT';
};

const NftTile: React.FC<{ nft: NFT; formatNftIndex: (index: string) => string }> = ({ nft, formatNftIndex }) => {
    const name = getNftName(nft, formatNftIndex);
    const indexLabel = nft.index ? formatNftIndex(nft.index) : null;

    return (
        <article className="flex-shrink-0 w-36 bg-gray-100 rounded-2xl overflow-hidden">
            <div className="aspect-square w-full overflow-hidden bg-gray-300">
                <FallbackImage src={getNftImageSources(nft)} alt={name} className="w-full h-full object-cover" />
            </div>
            <div className="p-2">
                <div className="text-sm font-semibold text-gray-900 truncate">{name}</div>
                {indexLabel && (
                    <div className="text-xs text-gray-500">
                        {indexLabel?.length > 10 ? `${indexLabel.slice(0, 6)}…` : indexLabel}
                    </div>
                )}
            </div>
        </article>
    );
};

export const NftsCard: React.FC = () => {
    const { userNfts, formatNftIndex } = useNfts();

    // Only render when there are NFTs to show — no skeletons, no empty block.
    if (userNfts.length === 0) {
        return null;
    }

    return (
        <section>
            <header className="flex items-center gap-1 mb-2">
                <h2 className="text-base font-semibold text-gray-900">NFTs</h2>
                <ChevronRight className="w-4 h-4 text-gray-400" />
            </header>

            <div className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-1 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
                {userNfts.map((nft) => (
                    <NftTile key={nft.address} nft={nft} formatNftIndex={formatNftIndex} />
                ))}
            </div>
        </section>
    );
};
