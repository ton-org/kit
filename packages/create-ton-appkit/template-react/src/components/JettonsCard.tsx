// Read balances — https://docs.ton.org/applications/appkit/howto/read-balances#render-a-jetton-row
// Send jettons — https://docs.ton.org/applications/appkit/howto/send-jettons
import { useJettons } from '@ton/appkit-react';

import { formatAmount } from '../utils/format';

export function JettonsCard() {
    const { data: jettonsData, isLoading } = useJettons({ query: { refetchInterval: 15000 } });
    const jettons = jettonsData?.jettons ?? [];

    if (isLoading) {
        return (
            <section className="card">
                <h2>Jettons</h2>
                <p className="loading">Loading…</p>
            </section>
        );
    }

    if (jettons.length === 0) {
        return (
            <section className="card">
                <h2>Jettons</h2>
                <p className="loading">No jettons yet.</p>
            </section>
        );
    }

    return (
        <section className="card">
            <h2>Jettons ({jettons.length})</h2>
            <ul className="jetton-list">
                {jettons.map((j) => {
                    const logoUrl = j.info.image?.smallUrl ?? j.info.image?.url;
                    return (
                        <li key={j.address} className="jetton-row">
                            {logoUrl ? (
                                <img
                                    className="jetton-logo"
                                    src={logoUrl}
                                    alt={j.info.symbol ?? ''}
                                    loading="lazy"
                                    referrerPolicy="no-referrer"
                                />
                            ) : (
                                <span className="jetton-logo jetton-logo-fallback">{(j.info.symbol ?? '?')[0]}</span>
                            )}
                            <span className="jetton-symbol">{j.info.symbol ?? 'Jetton'}</span>
                            <span className="jetton-balance">{formatAmount(j.balance)}</span>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
