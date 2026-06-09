// Staking widget — https://docs.ton.org/applications/appkit/howto/use-ui-widgets#staking-widget
// Staking how-to — https://docs.ton.org/applications/appkit/howto/staking
import { StakingWidget, Network } from '@ton/appkit-react';

export function StakingCard() {
    return (
        <section className="card">
            <h2>Staking</h2>
            <div className="staking-wrap">
                <StakingWidget network={Network.mainnet()} />
            </div>
        </section>
    );
}
