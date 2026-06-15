// Connect to a wallet — https://docs.ton.org/applications/appkit/howto/connect-to-a-wallet#drop-in-button
// UI widgets — https://docs.ton.org/applications/appkit/howto/use-ui-widgets#connect-button
import { TonConnectButton } from '@ton/appkit-react';

export function Header() {
    return (
        <header className="app-header">
            <div className="app-title">
                <img src="/favicon.svg" alt="" className="app-logo" />
                <h1>TON AppKit Template</h1>
            </div>
            <TonConnectButton />
        </header>
    );
}
