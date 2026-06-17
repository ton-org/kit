import { useState } from 'react';
import { useAddress } from '@ton/appkit-react';

import { Providers } from './Providers';
import { Header } from './components/Header';
import { BalanceCard } from './components/BalanceCard';
import { JettonsCard } from './components/JettonsCard';
import { NftsCard } from './components/NftsCard';
import { SwapCard } from './components/SwapCard';
import { StakingCard } from './components/StakingCard';
import './App.css';

const TABS = [
    { id: 'balance', label: 'Balance', Component: BalanceCard },
    { id: 'jettons', label: 'Jettons', Component: JettonsCard },
    { id: 'nfts', label: 'NFTs', Component: NftsCard },
    { id: 'swap', label: 'Swap', Component: SwapCard },
    { id: 'staking', label: 'Staking', Component: StakingCard },
] as const;

type TabId = (typeof TABS)[number]['id'];

function AppContent() {
    const address = useAddress();
    const [activeTab, setActiveTab] = useState<TabId>('balance');

    const ActiveComponent = TABS.find((tab) => tab.id === activeTab)!.Component;

    return (
        <div className="app">
            <Header />

            {!address ? (
                <section className="card empty">
                    <p>Connect a wallet to explore balance, jettons, NFTs, swap and staking.</p>
                </section>
            ) : (
                <>
                    <div className="tabs" role="tablist" aria-label="Wallet features">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                role="tab"
                                id={`tab-${tab.id}`}
                                aria-selected={tab.id === activeTab}
                                aria-controls={`panel-${tab.id}`}
                                className={`tab-btn${tab.id === activeTab ? ' active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
                        <ActiveComponent />
                    </div>
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
