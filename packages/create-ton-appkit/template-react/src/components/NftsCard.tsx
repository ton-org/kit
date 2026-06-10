// Manage NFTs — https://docs.ton.org/applications/appkit/howto/nfts
import { useState } from 'react';
import { useNfts, NftItem } from '@ton/appkit-react';

const INITIAL_VISIBLE = 6;

export function NftsCard() {
    const { data: nftsData, isLoading } = useNfts();
    const nfts = nftsData?.nfts ?? [];
    const [expanded, setExpanded] = useState(false);

    if (isLoading) {
        return (
            <section className="card">
                <h2>NFTs</h2>
                <p className="loading">Loading…</p>
            </section>
        );
    }

    if (nfts.length === 0) return null;

    const visible = expanded ? nfts : nfts.slice(0, INITIAL_VISIBLE);
    const hasMore = nfts.length > INITIAL_VISIBLE;

    return (
        <section className="card">
            <h2>NFTs ({nfts.length})</h2>
            <div className="nft-grid">
                {visible.map((nft) => (
                    <NftItem key={nft.address} nft={nft} />
                ))}
            </div>
            {hasMore && (
                <button type="button" className="show-more-btn" onClick={() => setExpanded(!expanded)}>
                    {expanded ? 'Show less' : `Show all ${nfts.length} NFTs`}
                </button>
            )}
        </section>
    );
}
