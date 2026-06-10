// Swap widget — https://docs.ton.org/applications/appkit/howto/use-ui-widgets#swap-widget
// Swap how-to — https://docs.ton.org/applications/appkit/howto/swaps
import { useCallback, useState } from 'react';
import { SwapWidget, SwapWidgetUI, Network } from '@ton/appkit-react';
import type { AppkitUIToken, SwapWidgetRenderProps } from '@ton/appkit-react';

const SWAP_TOKENS: AppkitUIToken[] = [
    {
        symbol: 'TON',
        name: 'Toncoin',
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

function SwapBody({ ctx }: { ctx: SwapWidgetRenderProps }) {
    const [submitError, setSubmitError] = useState<string | null>(null);

    const sendSwapTransaction = useCallback(async () => {
        setSubmitError(null);
        try {
            await ctx.sendSwapTransaction();
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : String(error));
        }
    }, [ctx]);

    return (
        <>
            <SwapWidgetUI {...ctx} sendSwapTransaction={sendSwapTransaction} />
            {submitError && (
                <div className="swap-error" role="alert">
                    <span>
                        <strong>Swap error:</strong> {submitError}
                    </span>
                    <button
                        type="button"
                        className="swap-error-dismiss"
                        onClick={() => setSubmitError(null)}
                        aria-label="Dismiss error"
                    ></button>
                </div>
            )}
        </>
    );
}

export function SwapCard() {
    return (
        <section className="card">
            <h2>Swap</h2>
            <SwapWidget
                tokens={SWAP_TOKENS}
                network={Network.mainnet()}
                fiatSymbol="$"
                defaultFromSymbol="TON"
                defaultToSymbol="USD₮"
            >
                {(ctx) => <SwapBody ctx={ctx} />}
            </SwapWidget>
        </section>
    );
}
