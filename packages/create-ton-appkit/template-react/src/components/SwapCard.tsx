// Swap widget — https://docs.ton.org/applications/appkit/howto/use-ui-widgets#swap-widget
// Swap how-to — https://docs.ton.org/applications/appkit/howto/swaps
import { SwapWidget, Network } from '@ton/appkit-react';
import type { AppkitUIToken } from '@ton/appkit-react';

const SWAP_TOKENS: AppkitUIToken[] = [
    {
        symbol: 'GRAM',
        name: 'Gram',
        decimals: 9,
        address: 'ton',
        network: Network.mainnet(),
        logo: 'https://asset.ston.fi/img/EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c/c8d21a3d93f9b574381e0a8d8f16d48b325dd8f54ce172f599c1e9d6c62f03f7',
    },
    {
        symbol: 'USD₮',
        name: 'Tether USD',
        decimals: 6,
        address: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
        network: Network.mainnet(),
        logo: 'https://asset.ston.fi/img/EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs/1a87edfee9a28b05578853952e5effb8cc30af1e0fb90043aa2ce19dce490849',
    },
];

export function SwapCard() {
    return (
        <section className="card">
            <h2>Swap</h2>
            <SwapWidget tokens={SWAP_TOKENS} fiatSymbol="$" defaultFromSymbol="GRAM" defaultToSymbol="USD₮" />
        </section>
    );
}
