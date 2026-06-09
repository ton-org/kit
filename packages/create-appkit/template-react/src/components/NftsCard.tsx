// Manage NFTs — https://docs.ton.org/applications/appkit/howto/nfts
import { useNfts, NftItem } from '@ton/appkit-react';

export function NftsCard() {
    const { data: nftsData, isLoading } = useNfts();
    const nfts = nftsData?.nfts ?? [];

    if (isLoading) {
        return (
            <section className="card">
                <h2>NFTs</h2>
                <p className="loading">Loading…</p>
            </section>
        );
    }

    if (nfts.length === 0) return null;

    return (
        <section className="card">
            <h2>NFTs ({nfts.length})</h2>
            <div className="nft-grid">
                {nfts.slice(0, 6).map((nft) => (
                    <NftItem key={nft.address} nft={nft} />
                ))}
            </div>
        </section>
    );
}
