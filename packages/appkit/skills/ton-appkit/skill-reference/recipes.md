# Extended AppKit Recipes

Code recipes for DeFi flows (swap, staking), jetton/NFT transfers, live transactions, and multi-network apps. Read this when a basic hook reference isn't enough.

**Before building from hooks, try the drop-in component first** (see SKILL.md "Drop-in Components"). E.g., for swap: `<SwapWidget tokens={...} />`. The hook-based recipes below are for cases where you need a fully custom UX.

When adapting these recipes, preserve AppKit's consumer-facing invariants: transfer amounts are human-readable strings, wallet-scoped caches need explicit cleanup, streaming recipes need a registered streaming provider, and multi-network reads should pass `network` explicitly.

## Swap Flow

### Drop-in (recommended)
```tsx
import { SwapWidget } from '@ton/appkit-react';
<SwapWidget tokens={[{ address: 'ton', ... }, { address: 'EQUSDT...', ... }]} />
```
For custom UI within the widget's state: pass render-prop children. Register DEX providers in AppKit config — imported from sub-path entries, NOT from the main `@ton/appkit` package:

```ts
import { createDeDustProvider } from '@ton/appkit/swap/dedust';
import { createOmnistonProvider } from '@ton/appkit/swap/omniston';

providers: [createDeDustProvider({ /* ... */ }), createOmnistonProvider({ /* ... */ })]
```

### From hooks (custom UX)
```tsx
import { useSwapQuote, useBuildSwapTransaction, useSendTransaction } from '@ton/appkit-react';

function SwapForm({ fromToken, toToken }: { fromToken: SwapToken; toToken: SwapToken }) {
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
        if (!quote) return;
        const tx = await buildSwap({ quote });
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
import { useStakingProviders, useStakingQuote, useBuildStakeTransaction, useStakedBalance } from '@ton/appkit-react';

function StakeForm({ userAddress }: { userAddress: string }) {
    const { data: providers } = useStakingProviders();
    const [providerId, setProviderId] = useState<string>();
    const [amount, setAmount] = useState('10');

    const { data: quote } = useStakingQuote({
        amount,
        direction: 'stake',
        providerId,
    });

    const { data: stakedBalance } = useStakedBalance({ userAddress });
    const { mutateAsync: buildStake } = useBuildStakeTransaction();
    const { mutate: sendTx } = useSendTransaction();

    return (
        <>
            <select onChange={(e) => setProviderId(e.target.value)}>
                {providers?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input value={amount} onChange={(e) => setAmount(e.target.value)} />
            {quote && <p>You'll stake {quote.amountOut} (APY: {quote.apy}%)</p>}
            <p>Currently staked: {stakedBalance?.stakedBalance}</p>
            <button onClick={async () => {
                if (!quote || !providerId) return;
                const tx = await buildStake({ amount, direction: 'stake', providerId });
                sendTx(tx);
            }}>Stake</button>
        </>
    );
}
```

For unstake, change `direction: 'unstake'` and use `quote.unstakeMode` to handle different protocols.

## Jetton Transfer

```tsx
import { useJettons, useTransferJetton } from '@ton/appkit-react';

function SendJetton() {
    const { data: jettons } = useJettons();
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
                {jettons?.map(j => (
                    <option key={j.address} value={j.address}>
                        {j.symbol} ({j.balance})
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
import { useNfts, useTransferNft } from '@ton/appkit-react';

function SendNft() {
    const { data: nfts } = useNfts();
    const [selected, setSelected] = useState<string>();
    const [recipient, setRecipient] = useState('');

    const { mutate: transfer, isPending } = useTransferNft();

    return (
        <>
            <div>
                {nfts?.map(nft => (
                    <button key={nft.address} onClick={() => setSelected(nft.address)}>
                        {nft.metadata?.name ?? nft.address}
                    </button>
                ))}
            </div>
            <input value={recipient} onChange={(e) => setRecipient(e.target.value)} />
            <button
                disabled={!selected || isPending}
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
import { useWatchTransactions } from '@ton/appkit-react';

function TransactionFeed() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useWatchTransactions({
        onChange: (tx) => setTransactions((prev) => [tx, ...prev]),
    });

    return (
        <ul>
            {transactions.map(tx => (
                <li key={tx.hash}>{tx.hash}: {tx.status}</li>
            ))}
        </ul>
    );
}
```

Requires a streaming provider registered (see SKILL.md "Real-time balance updates").

## Multi-Network App

```ts
import { Network, createTonCenterStreamingProvider } from '@ton/appkit';

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
const { data: balance } = useBalanceByAddress({ address, network: Network.testnet() });
```

## Custom Mutation Cleanup

If you have your own mutations that change wallet state, use the same cache patterns:

```tsx
const queryClient = useQueryClient();

const myCustomTransfer = useMutation({
    mutationFn: async (params) => { /* ... */ },
    onSuccess: () => {
        // Invalidate everything that might be affected
        queryClient.invalidateQueries({ queryKey: ['balance'] });
        queryClient.invalidateQueries({ queryKey: ['jettons'] });
        queryClient.invalidateQueries({ queryKey: ['transactionStatus'] });
    },
});
```
