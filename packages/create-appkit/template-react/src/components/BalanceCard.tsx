// Read balances — https://docs.ton.org/applications/appkit/howto/read-balances
// Live updates — https://docs.ton.org/applications/appkit/howto/streaming#watch-a-balance
// Send Toncoin — https://docs.ton.org/applications/appkit/howto/send-toncoin
import { useBalance, useWatchBalance, SendTonButton, useAddress } from '@ton/appkit-react';

const amountFormatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
    useGrouping: false,
});

function formatAmount(value: string): string {
    const n = Number(value);
    if (!Number.isFinite(n)) return value;
    return amountFormatter.format(n);
}

export function BalanceCard() {
    const address = useAddress();
    useWatchBalance();
    const { data: balance, isLoading } = useBalance();

    const balanceText = balance != null ? `${formatAmount(balance)} TON` : '—';
    const showLoading = balance == null && isLoading;

    return (
        <>
            <section className="card">
                <h2>Balance</h2>
                {showLoading ? <p className="big loading">Loading…</p> : <p className="big">{balanceText}</p>}
            </section>

            {address && (
                <section className="card">
                    <h2>Send 0.01 TON to self</h2>
                    <SendTonButton recipientAddress={address} amount="0.01" />
                </section>
            )}
        </>
    );
}
