# Extended AppKit Recipes

Code recipes for DeFi flows (swap, staking), jetton/NFT transfers, live transactions, and multi-network apps. Read this when a basic hook reference isn't enough.

**Before building from hooks, try the drop-in component first** (see SKILL.md "Drop-in Components"). E.g., for swap: `<SwapWidget tokens={...} />`. The hook-based recipes below are for cases where you need a fully custom UX.

When adapting these recipes, preserve AppKit's consumer-facing invariants: transfer amounts are human-readable strings, wallet-scoped caches need explicit cleanup, streaming recipes need a registered streaming provider, and multi-network reads should pass `network` explicitly.

## Swap Flow

### Drop-in (recommended)
```tsx
import { SwapWidget, Network } from '@ton/appkit-react';
import type { AppkitUIToken } from '@ton/appkit-react';

const tokens: AppkitUIToken[] = [
    { address: 'ton', symbol: 'TON', name: 'Toncoin', decimals: 9, network: Network.mainnet() },
    { address: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs', symbol: 'USDT', name: 'Tether USD', decimals: 6, network: Network.mainnet() },
];

function SwapPage() {
    return <SwapWidget tokens={tokens} />;
}
```
For custom UI within the widget's state: pass render-prop children. Register DEX providers in AppKit config — imported from sub-path entries, NOT from the main `@ton/appkit` package:

```ts
import { createDeDustProvider } from '@ton/appkit/swap/dedust';
import { createOmnistonProvider } from '@ton/appkit/swap/omniston';

const providers = [createDeDustProvider(), createOmnistonProvider()];
```

### From hooks (custom UX)
```tsx
import { useState } from 'react';
import { useSwapQuote, useBuildSwapTransaction, useSendTransaction, useAddress } from '@ton/appkit-react';
import type { SwapToken } from '@ton/appkit-react';

function SwapForm({ fromToken, toToken }: { fromToken: SwapToken; toToken: SwapToken }) {
    const userAddress = useAddress();
    const [amount, setAmount] = useState('1');

    // 1. Get a quote
    const { data: quote, isLoading: quoteLoading } = useSwapQuote({
        from: fromToken,
        to: toToken,
        amount,
        slippageBps: 100, // 1%
    });

    // 2. Build and send transaction
    const { mutateAsync: buildSwap } = useBuildSwapTransaction();
    const { mutate: sendTx, isPending: sending } = useSendTransaction();

    const handleSwap = async () => {
        if (!quote || !userAddress) return;
        const tx = await buildSwap({ quote, userAddress });
        sendTx(tx);
    };

    return (
        <>
            <input value={amount} onChange={(e) => setAmount(e.target.value)} />
            {quoteLoading && <p>Getting quote...</p>}
            {quote && (
                <p>You'll receive: {quote.toAmount} {toToken.symbol} (price impact: {quote.priceImpact}%)</p>
            )}
            <button disabled={!quote || sending} onClick={handleSwap}>Swap</button>
        </>
    );
}
```

## Staking Flow

```tsx
import { useState } from 'react';
import {
    useStakingProviders,
    useStakingQuote,
    useBuildStakeTransaction,
    useStakedBalance,
    useSendTransaction,
} from '@ton/appkit-react';

function StakeForm({ userAddress }: { userAddress: string }) {
    const providers = useStakingProviders();
    const [providerId, setProviderId] = useState<string | undefined>(providers[0]?.providerId);
    const [amount, setAmount] = useState('10');

    const { data: quote } = useStakingQuote({
        amount,
        direction: 'stake',
        providerId,
    });

    const { data: stakedBalance } = useStakedBalance({ userAddress, providerId });
    const { mutateAsync: buildStake } = useBuildStakeTransaction();
    const { mutate: sendTx } = useSendTransaction();

    return (
        <>
            <select value={providerId ?? ''} onChange={(e) => setProviderId(e.target.value)}>
                {providers.map((p) => (
                    <option key={p.providerId} value={p.providerId}>{p.providerId}</option>
                ))}
            </select>
            <input value={amount} onChange={(e) => setAmount(e.target.value)} />
            {quote && <p>You'll stake {quote.amountIn} → receive {quote.amountOut}</p>}
            <p>Currently staked: {stakedBalance?.stakedBalance}</p>
            <button onClick={async () => {
                if (!quote) return;
                const tx = await buildStake({ quote, userAddress });
                sendTx(tx);
            }}>Stake</button>
        </>
    );
}
```

For unstake, pass `direction: 'unstake'` to `useStakingQuote`. The returned quote may include an `unstakeMode` that differs by protocol — read it from the quote and forward via `providerOptions` if your protocol needs it.

## Jetton Transfer

```tsx
import { useState } from 'react';
import { useJettons, useTransferJetton } from '@ton/appkit-react';
import { useQueryClient } from '@tanstack/react-query';

function SendJetton() {
    const { data } = useJettons(); // { jettons: Jetton[], addressBook }
    const jettons = data?.jettons ?? [];
    const [selectedJetton, setSelectedJetton] = useState<string>();
    const [amount, setAmount] = useState('');
    const [recipient, setRecipient] = useState('');

    const { mutate: transfer, isPending, error } = useTransferJetton();
    const queryClient = useQueryClient();

    const handleSend = () => {
        if (!selectedJetton) return;
        transfer(
            { jettonAddress: selectedJetton, recipientAddress: recipient, amount },
            {
                onSuccess: () => {
                    // Refresh jetton balances
                    queryClient.invalidateQueries({ queryKey: ['jettons'] });
                    queryClient.invalidateQueries({ queryKey: ['jetton-balance'] });
                },
            },
        );
    };

    return (
        <>
            <select onChange={(e) => setSelectedJetton(e.target.value)}>
                {jettons.map((j) => (
                    <option key={j.address} value={j.address}>
                        {j.info.symbol} ({j.balance /* already formatted */})
                    </option>
                ))}
            </select>
            <input placeholder="Recipient" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
            <input placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <button disabled={isPending} onClick={handleSend}>
                {isPending ? 'Sending...' : 'Send Jetton'}
            </button>
            {error && <p>Error: {error.message}</p>}
        </>
    );
}
```

Notes:
- `amount` is a human-readable string with respect to jetton decimals. AppKit handles `parseUnits` internally.
- Jetton transfers are contract message flows — gas matters. AppKit's helper sets correct `forward_amount` and `response_destination`.

## NFT Transfer

```tsx
import { useState } from 'react';
import { useNfts, useTransferNft } from '@ton/appkit-react';

function SendNft() {
    const { data } = useNfts(); // { nfts: NFT[], addressBook? }
    const nfts = data?.nfts ?? [];
    const [selected, setSelected] = useState<string>();
    const [recipient, setRecipient] = useState('');

    const { mutate: transfer, isPending } = useTransferNft();

    return (
        <>
            <div>
                {nfts.map((nft) => (
                    <button key={nft.address} onClick={() => setSelected(nft.address)}>
                        {nft.info?.name ?? nft.address}
                    </button>
                ))}
            </div>
            <input value={recipient} onChange={(e) => setRecipient(e.target.value)} />
            <button
                disabled={!selected || isPending}
                // ⚠ The param is `nftAddress` (the NFT item's contract address) — NOT `tokenAddress`.
                onClick={() => transfer({ nftAddress: selected!, recipientAddress: recipient })}
            >
                Send NFT
            </button>
        </>
    );
}
```

## Watching Transactions

```tsx
import { useState } from 'react';
import { useWatchTransactions } from '@ton/appkit-react';
import type { TransactionsUpdate } from '@ton/appkit-react';

function TransactionFeed() {
    const [updates, setUpdates] = useState<TransactionsUpdate[]>([]);

    useWatchTransactions({
        // onChange fires with a TransactionsUpdate that wraps one or more on-chain transactions.
        onChange: (update) => setUpdates((prev) => [update, ...prev]),
    });

    return (
        <ul>
            {updates.flatMap((u) => u.transactions).map((tx) => (
                <li key={tx.hash}>{tx.hash}: {tx.endStatus ?? '—'}</li>
            ))}
        </ul>
    );
}
```

Requires a streaming provider registered (see SKILL.md "Real-time balance updates").

## Multi-Network App

```ts
import { AppKit, Network, createTonCenterStreamingProvider, createTonConnectConnector } from '@ton/appkit';

const appKit = new AppKit({
    defaultNetwork: Network.mainnet(),
    networks: {
        [Network.mainnet().chainId]: {
            apiClient: { url: 'https://toncenter.com', key: 'MAINNET_KEY' },
        },
        [Network.testnet().chainId]: {
            apiClient: { url: 'https://testnet.toncenter.com', key: 'TESTNET_KEY' },
        },
    },
    providers: [
        createTonCenterStreamingProvider({ network: Network.mainnet(), apiKey: 'MAINNET_KEY' }),
        createTonCenterStreamingProvider({ network: Network.testnet(), apiKey: 'TESTNET_KEY' }),
    ],
    connectors: [createTonConnectConnector({ tonConnectOptions: { manifestUrl: '/manifest.json' } })],
});
```

Hooks accept a `network` parameter to override:

```tsx
import { useBalanceByAddress } from '@ton/appkit-react';
import { Network } from '@ton/appkit';

function TestnetBalance({ address }: { address: string }) {
    const { data: balance } = useBalanceByAddress({ address, network: Network.testnet() });
    return <span>{balance ?? '—'}</span>;
}
```

## Custom Mutation Cleanup

If you have your own mutations that change wallet state, use the same cache patterns:

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';

function useMyCustomTransfer() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (params: { recipientAddress: string; amount: string }) => {
            // ... your custom transfer implementation
            return params;
        },
        onSuccess: () => {
            // Invalidate everything that might be affected
            queryClient.invalidateQueries({ queryKey: ['balance'] });
            queryClient.invalidateQueries({ queryKey: ['jettons'] });
            queryClient.invalidateQueries({ queryKey: ['transactionStatus'] });
        },
    });
}
```

## Crypto Onramp Flow

Onramp = user deposits crypto on a **source chain** (e.g. USDT on Arbitrum) and receives **TON or a jetton**. Like swap/staking, it needs a provider registered in AppKit config.

### Drop-in (recommended)
```tsx
import { CryptoOnrampWidget, Caip2ByNetwork } from '@ton/appkit-react';
import type { CryptoOnrampDestinationRef, CryptoOnrampSourceRef } from '@ton/appkit-react';

const destination: CryptoOnrampDestinationRef = { address: 'ton' }; // or a jetton master
const source: CryptoOnrampSourceRef = {
    chain: Caip2ByNetwork.ArbitrumMainnet,
    address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9', // USDT, or 'native'
};

function BuyTonPage() {
    return <CryptoOnrampWidget defaultDestination={destination} defaultSource={source} />;
}
```
Register providers in AppKit config — from sub-path entries, NOT the main package:
```ts
import { createLayerswapProvider } from '@ton/appkit/crypto-onramp/layerswap';
import { createDecentProvider } from '@ton/appkit/crypto-onramp/decent';

const providers = [createLayerswapProvider(), createDecentProvider({ apiKey: 'DECENT_KEY' })];
```

### From hooks (custom UX)
The flow is quote → create deposit → poll status. Amounts in quote/deposit are in **base units** (per the currency's `decimals`), not the pre-formatted decimal strings `useBalance` returns — convert at the UI boundary.

```tsx
import { useState } from 'react';
import {
    useCryptoOnrampSupportedCurrencies,
    useCryptoOnrampQuote,
    useCreateCryptoOnrampDeposit,
    useCryptoOnrampStatus,
    useAddress,
} from '@ton/appkit-react';

function OnrampForm() {
    const recipientAddress = useAddress();
    const [amount, setAmount] = useState('100');
    const [depositId, setDepositId] = useState<string>();

    const { data: currencies } = useCryptoOnrampSupportedCurrencies({});
    const sourceCurrency = currencies?.source[0];
    const targetCurrency = currencies?.destination[0];

    const { data: quote, isLoading: quoteLoading } = useCryptoOnrampQuote({
        amount,
        sourceCurrency,
        targetCurrency,
        recipientAddress,
    });

    const { mutateAsync: createDeposit, isPending: creating } = useCreateCryptoOnrampDeposit();
    const { data: status } = useCryptoOnrampStatus({ depositId, providerId: quote?.providerId });

    const handleBuy = async () => {
        if (!quote || !recipientAddress) return;
        const deposit = await createDeposit({ quote, refundAddress: recipientAddress });
        setDepositId(deposit.depositId);
        // Show deposit.address / deposit.amount / deposit.memo for the user to send funds to.
    };

    return (
        <>
            <input value={amount} onChange={(e) => setAmount(e.target.value)} />
            {quoteLoading && <p>Getting quote…</p>}
            {quote && <p>You'll receive ~{quote.targetAmount} (base units)</p>}
            <button disabled={!quote || creating} onClick={handleBuy}>Get deposit address</button>
            {status && <p>Deposit status: {status}</p>}
        </>
    );
}
```

Gotchas:
- **No provider registered → empty widget / empty currency lists.** Register `createLayerswapProvider()` / `createDecentProvider({ apiKey })` first.
- `createDecentProvider` **requires** `apiKey`; `createLayerswapProvider()` config is optional.
- Hook param names disagree: `useCryptoOnrampProviderById({ id })` vs `useCryptoOnrampProviderMetadata({ providerId })`.
- `useCryptoOnrampStatus` is disabled until you pass a `depositId` — set it from the `createDeposit` result.

## Custom Provider

For app-specific capabilities not covered by swap/staking/onramp, register a provider with `type: 'custom'` and read it back with `useCustomProvider`:

```tsx
import type { CustomProvider } from '@ton/appkit-react';
import { useCustomProvider } from '@ton/appkit-react';

interface MyProvider extends CustomProvider {
    providerId: 'my-provider';
    type: 'custom';
    doThing(input: string): Promise<void>;
}

// register at config time: new AppKit({ providers: [myProviderInstance] })

function Feature() {
    const provider = useCustomProvider<MyProvider>('my-provider'); // positional id, not an object
    if (!provider) return <p>Provider not registered</p>;
    return <button onClick={() => provider.doThing('x')}>Run</button>;
}
```

The generic `<MyProvider>` is a type cast — there's no runtime guard verifying the registered provider actually matches, so keep the id ↔ shape mapping correct yourself.
