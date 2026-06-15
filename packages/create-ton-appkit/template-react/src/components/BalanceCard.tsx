// Read balances — https://docs.ton.org/applications/appkit/howto/read-balances
// Send Toncoin — https://docs.ton.org/applications/appkit/howto/send-toncoin
import { useBalance, SendTonButton, useAddress } from '@ton/appkit-react';

import { formatAmount } from '../utils/format';

export function BalanceCard() {
    const address = useAddress();
    const { data: balance, isLoading } = useBalance({ query: { refetchInterval: 15000 } });

    const balanceText = balance !== undefined ? `${formatAmount(balance)} GRAM` : '—';
    const showLoading = balance === undefined && isLoading;

    return (
        <section className="card">
            <h2>Balance</h2>
            {showLoading ? <p className="big loading">Loading…</p> : <p className="big">{balanceText}</p>}
            {address && <SendTonButton recipientAddress={address} amount="0.01" />}
        </section>
    );
}
