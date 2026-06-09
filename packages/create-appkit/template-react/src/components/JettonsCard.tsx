// Read balances — https://docs.ton.org/applications/appkit/howto/read-balances#render-a-jetton-row
// Send jettons — https://docs.ton.org/applications/appkit/howto/send-jettons
import { useState } from 'react';
import { useJettons } from '@ton/appkit-react';

const INITIAL_VISIBLE = 5;

function formatAmount(value: string): string {
    const n = Number(value);
    if (!Number.isFinite(n)) return value;
    if (n === 0) return '0';

    const abs = Math.abs(n);
    if (abs >= 1) {
        return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    }

    // For small numbers, show up to the first significant digit + 1
    const digits = Math.max(2, -Math.floor(Math.log10(abs)) + 1);
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: digits });
}

export function JettonsCard() {
    const { data: jettonsData, isLoading } = useJettons();
    const jettons = jettonsData?.jettons ?? [];
    const [expanded, setExpanded] = useState(false);

    if (isLoading) {
        return (
            <section className="card">
                <h2>Jettons</h2>
                <p className="loading">Loading…</p>
            </section>
        );
    }

    if (jettons.length === 0) return null;

    const visible = expanded ? jettons : jettons.slice(0, INITIAL_VISIBLE);
    const hasMore = jettons.length > INITIAL_VISIBLE;

    return (
        <section className="card">
            <h2>Jettons ({jettons.length})</h2>
            <ul className="jetton-list">
                {visible.map((j) => {
                    const logoUrl = j.info.image?.smallUrl ?? j.info.image?.url;
                    return (
                        <li key={j.address} className="jetton-row">
                            {logoUrl ? (
                                <img
                                    className="jetton-logo"
                                    src={logoUrl}
                                    alt={j.info.symbol ?? ''}
                                    referrerPolicy="no-referrer"
                                />
                            ) : (
                                <span className="jetton-logo jetton-logo-fallback">
                                    {(j.info.symbol ?? '?')[0]}
                                </span>
                            )}
                            <span className="jetton-symbol">{j.info.symbol ?? 'Jetton'}</span>
                            <span className="jetton-balance">{formatAmount(j.balance)}</span>
                        </li>
                    );
                })}
            </ul>
            {hasMore && (
                <button
                    type="button"
                    className="show-more-btn"
                    onClick={() => setExpanded(!expanded)}
                >
                    {expanded ? 'Show less' : `Show all ${jettons.length} jettons`}
                </button>
            )}
        </section>
    );
}
