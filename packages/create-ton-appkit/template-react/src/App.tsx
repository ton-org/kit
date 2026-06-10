import { useAddress } from '@ton/appkit-react';

import { Providers } from './Providers';
import { Header } from './components/Header';
import { BalanceCard } from './components/BalanceCard';
import { JettonsCard } from './components/JettonsCard';
import { NftsCard } from './components/NftsCard';
import { SwapCard } from './components/SwapCard';
import { StakingCard } from './components/StakingCard';
import './App.css';

function AppContent() {
    const address = useAddress();

    return (
        <div className="app">
            <Header />

            {!address && (
                <section className="card empty">
                    <p>Connect a wallet to explore balance, jettons, NFTs, swap and staking.</p>
                </section>
            )}

            {address && (
                <>
                    <BalanceCard />
                    <JettonsCard />
                    <NftsCard />
                    <SwapCard />
                    <StakingCard />
                </>
            )}
        </div>
    );
}

export function App() {
    return (
        <Providers>
            <AppContent />
        </Providers>
    );
}
