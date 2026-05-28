---
name: ton-appkit
description: Use this skill whenever the user is building an app with @ton/appkit or @ton/appkit-react as a library consumer: setup, TonConnect wallet connection, balances, sending TON/jettons/NFTs, swaps, staking, signing, real-time WebSocket updates, cache invalidation, mainnet/testnet switching, SSR/Next.js hydration, Telegram Mini App returns, iOS deep links, or debugging stale wallet/network/transaction behavior. Do not use for contributing code to the @ton/kit monorepo itself; use kit-dev for repo-internal development tasks.
---

# AppKit Guide

Guide developers consuming `@ton/appkit` + `@ton/appkit-react` in their TON apps. Assume React, TypeScript, and TanStack Query basics, but explain TON/AppKit-specific decisions clearly.

For contributing to the @ton/kit monorepo, use `kit-dev` instead. This skill is for library-consumer answers: code the user's app would write, not package internals.

## Response workflow

1. **Classify the task first.** If the user wants a complete feature quickly, prefer drop-in components. If they describe custom UX, use hooks. If they report stale data, real-time, network, or SSR symptoms, start with the relevant gotcha before writing code.
2. **Give runnable integration shape.** Include provider setup when the bug could come from missing `QueryClientProvider`, `AppKitProvider`, connector config, CSS import, `ssr: true`, or streaming providers. Avoid isolated hook snippets that omit required context.
3. **Use AppKit semantics exactly.** Balances are `bigint` nanoTON, transfer amounts are human-readable strings, mutations do not automatically invalidate caches, streaming is opt-in, and wallet state is client-only for SSR.
4. **Name the tradeoff.** Drop-in components are fastest and safest; hooks are for custom UX and require explicit loading/error/cache handling.

## What do you want to do?

| Task | Path |
|---|---|
| Set up a new app | Quick Setup below |
| Wallet connect/disconnect | `<TonConnectButton />` or `useConnect`/`useDisconnect` |
| Show TON balance | `useBalance()` + optionally `useWatchBalance()` for live updates |
| Send TON | `<SendTonButton />` or `useTransferTon()` |
| Send jettons (USDT, etc.) | `<SendJettonButton />` or `useTransferJetton()` |
| Show NFTs | `useNfts()` + `<NftItem />` |
| Swap tokens | `<SwapWidget />` or `useSwapQuote` + `useBuildSwapTransaction` + `useSendTransaction` |
| Stake TON | `<StakingWidget />` or staking hooks |
| Sign message | `useSignText` / `useSignBinary` / `useSignCell` |
| Mainnet/testnet support | Configure both networks + `useDefaultNetwork()` + explicit `network` params |
| Real-time updates | Register streaming provider + mount `useWatchBalance` / `useWatchTransactions` |
| Fix Next.js hydration | `'use client'` providers + `ssr: true` + mount gate or dynamic import |
| Refresh balance after send | `queryClient.invalidateQueries({ queryKey: ['balance'] })` |
| Clear stale data on disconnect | `queryClient.removeQueries` for wallet-scoped keys |

Drop-in components (`<TonConnectButton />`, `<SendTonButton />`, `<SwapWidget />`, etc.) are the fastest path. Use hooks only for custom UX.

For extended swap/staking/jetton recipes, see [skill-reference/recipes.md](skill-reference/recipes.md).

## Packages

- **`@ton/appkit`** — core SDK: `AppKit` class, actions, connectors (TonConnect), DeFi managers.
- **`@ton/appkit-react`** — React hooks, `AppKitProvider`, UI components.
- **`@tanstack/react-query`** — required peer dependency.

## Quick Setup

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppKit, Network, createTonConnectConnector } from '@ton/appkit';
import { AppKitProvider } from '@ton/appkit-react';
import '@ton/appkit-react/styles.css';

const queryClient = new QueryClient({
    defaultOptions: { queries: { refetchOnWindowFocus: false } },
});

const appKit = new AppKit({
    networks: {
        [Network.mainnet().chainId]: {
            apiClient: { url: 'https://toncenter.com', key: 'YOUR_API_KEY' },
        },
        // Keep testnet too so users on testnet wallets aren't silently rejected.
        // Drop it once you're production-only.
        [Network.testnet().chainId]: {
            apiClient: { url: 'https://testnet.toncenter.com', key: 'YOUR_API_KEY' },
        },
    },
    connectors: [
        createTonConnectConnector({
            tonConnectOptions: { manifestUrl: 'https://your-app.com/tonconnect-manifest.json' },
        }),
    ],
});

// QueryClientProvider MUST wrap AppKitProvider
function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AppKitProvider appKit={appKit}>{/* your app */}</AppKitProvider>
        </QueryClientProvider>
    );
}
```

For Next.js: add `'use client'` to providers file, pass `ssr: true` to `AppKit` config, and gate wallet-dependent UI until mount (or use `dynamic(() => import(...), { ssr: false })`).

### Browser polyfills (Vite / Webpack / Rspack)

`@ton/core` (transitive dep) uses Node's `Buffer` and `process`. Browser bundlers don't include these by default — without polyfills you get a **white screen and `ReferenceError: Buffer is not defined`** at runtime.

For Vite, install `vite-plugin-node-polyfills` and add it to `vite.config.ts`:
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
export default defineConfig({ plugins: [react(), nodePolyfills()] });
```

If the plugin clashes with your project (e.g. nested workspace, alias resolution warnings), use a manual polyfill instead — `pnpm add buffer process`, then create `src/polyfills.ts`:
```ts
import { Buffer } from 'buffer';
import process from 'process';
(globalThis as { Buffer?: typeof Buffer }).Buffer = Buffer;
(globalThis as { process?: typeof process }).process = process;
```
Import `./polyfills` as the **first line of `main.tsx`** (before any AppKit code).

Next.js: no polyfill needed — Next's Webpack config handles Node globals automatically.

### First-touch send: self-transfer

For a safe end-to-end test of the send flow, use `useAddress()` as the recipient — the user sends 0.01 TON to themselves. Validates wallet, network, signing, and on-chain confirmation without risk:
```tsx
const address = useAddress();
{address && <SendTonButton recipientAddress={address} amount="0.01" />}
```
For real recipients, paste a TON address from Tonkeeper (UQ… non-bounceable for wallets, EQ… bounceable for contracts). Random/made-up strings without valid checksums make Tonkeeper's simulator say "no changes to your account" and refuse to sign.

## Hooks Reference

Hooks come from `@ton/appkit-react`. Queries return TanStack `{ data, isLoading, isError, error }`. Mutations return `{ mutate, mutateAsync, isPending, error, data, reset }`.

### Wallet
`useConnectors()` · `useConnect()` · `useDisconnect()` · `useSelectedWallet()` · `useAddress()` · `useConnectedWallets()`

`useConnect()` returns a mutation; call it with `mutate({ connectorId })`, passing the connector's `id` from `useConnectors()` (not the connector object itself). On iOS, the deep link that opens the wallet only fires if `connect()` runs in the **same synchronous tick as the user's click** — any `await` before it kills the user-activation token and the wallet won't open.

```tsx
const connectors = useConnectors();
const { mutate: connect, isPending } = useConnect();

// ✅ Good: synchronous in click handler
<button onClick={() => connect({ connectorId: connector.id })}>Connect</button>

// ❌ Bad on iOS: awaiting before connect() loses the user gesture
<button onClick={async () => {
    await analytics.track('connect_clicked'); // <-- breaks deep link on iOS
    connect({ connectorId: connector.id });
}}>Connect</button>
```
If you need side effects, fire-and-forget them (no `await`) or run them in `mutation: { onSuccess }`.

### Balance & assets
- `useBalance()` / `useBalanceByAddress({ address, network? })` — returns `bigint` (nanoTON, divide by 1e9 for TON). Pass `network` explicitly for cross-network reads: `useBalanceByAddress({ address, network: Network.testnet() })`.
- `useWatchBalance()` / `useWatchBalanceByAddress(...)` — real-time updates (requires streaming provider)
- `useJettons()` / `useJettonBalanceByAddress({ jettonAddress, ownerAddress })` / `useJettonInfo` / `useJettonWalletAddress` (note: parameter is `ownerAddress`, not `address`)
- `useNfts()` / `useNft({ address })` (`address` is the NFT item's own contract address — NOT `tokenAddress`)

### Sending
`useTransferTon()` · `useTransferJetton()` · `useTransferNft()` · `useSendTransaction()`

Call with `mutate({ recipientAddress, amount: '0.5', comment? })`. Amount is a **human-readable string** — AppKit converts using token decimals. The mutation's `data` resolves to `SendTransactionResponse = { boc, normalizedBoc, normalizedHash }` (object, not a bare string).

Param names differ per asset — easy to get wrong from intuition:
- **TON**: `mutate({ recipientAddress, amount, comment? })`
- **Jetton**: `mutate({ jettonAddress, recipientAddress, amount, comment? })` — `jettonAddress` is the jetton master contract.
- **NFT**: `mutate({ nftAddress, recipientAddress, amount?, comment? })` — **`nftAddress`** (NOT `tokenAddress`!) is the individual NFT item's contract address (`nft.address` from `useNfts()`). Optional `amount` is the forward TON (gas/notification), defaults are sensible. There is no `<SendNftButton />` drop-in — compose from the hook.

### Signing
`useSignText()` · `useSignBinary()` · `useSignCell()`

### Network
`useNetwork()` (selected wallet's network, `undefined` if not connected) · `useDefaultNetwork()` returns `[defaultNetwork, setDefaultNetwork]` · `useNetworks()` · `useBlockNumber()`

For mainnet/testnet apps, configure both networks and make reads explicit when the UI lets users choose a network:
```tsx
const [network, setNetwork] = useDefaultNetwork();
const { data: balance } = useBalanceByAddress({ address, network });
<button onClick={() => setNetwork(Network.mainnet())}>Mainnet</button>
<button onClick={() => setNetwork(Network.testnet())}>Testnet</button>
```

### DeFi
- Swap: `useSwapQuote({ from, to, amount, slippageBps? })` · `useBuildSwapTransaction()` · `useSwapProviders()` · `useSwapProvider()`
- Staking: `useStakingProviders()` · `useStakingQuote({ amount, direction })` · `useBuildStakeTransaction()` · `useStakedBalance({ userAddress })`

When you compose these into a custom UI (instead of `<SwapWidget />` / `<StakingWidget />`), you own loading and error state for every step: `useSwapQuote().isLoading` for the quote, `useBuildSwapTransaction().isPending` for the build, `useSendTransaction().isPending` for the send. Disable the submit button on the active step's pending flag, render the active step's `error.message`, and call `reset()` for retry. The widgets handle this for you; the hooks deliberately don't.

## Drop-in Components

Full-featured React components from `@ton/appkit-react`. They handle their own state, loading, and errors:

| Component | Use for |
|---|---|
| `<TonConnectButton />` | Wallet connect/disconnect UI |
| `<SendTonButton recipientAddress amount comment? onSuccess? onError? />` | Send TON |
| `<SendJettonButton />` | Send jettons (NFT transfers via `useTransferNft` hook — no drop-in button) |
| `<SwapWidget tokens={...} />` | Full swap UI |
| `<StakingWidget />` | Full staking UI |
| `<NftItem nft={...} />` | NFT card (image, name, collection, badge) |
| `<TransactionProgress boc={...} />` | Tracks tx until on-chain finalized |

Render-prop pattern for custom UI with built-in state:
```tsx
<SwapWidget tokens={tokens}>{(ctx) => <YourUI {...ctx} />}</SwapWidget>
```

## Query Key Prefixes

For `invalidateQueries` / `removeQueries`. TanStack prefix-matches on the **first array element** — passing `queryKey: ['balance']` invalidates every `['balance', { address: A, network: M }]`, `['balance', { address: B, network: T }]`, etc. You rarely need to enumerate addresses; matching by the bare prefix is enough.

| Prefix | Full key shape | Caches |
|---|---|---|
| `['balance']` | `['balance', { address, network }]` | TON balance |
| `['nfts']` | `['nfts', { address, network }]` | NFT list |
| `['nft']` | `['nft', { address, network? }]` | Single NFT (`address` = NFT item's contract address) |
| `['jettons']` | `['jettons', { address, network }]` | Jetton list |
| `['jetton-balance']` / `['jetton-info']` / `['jetton-wallet-address']` | kebab-case keys with `{ jettonAddress, ownerAddress }` | Jetton state (kebab-case — camelCase will silently match nothing) |
| `['stakedBalance']` / `['stakingProviderInfo']` / `['stakingQuote']` | camelCase keys | Staking |
| `['swapQuote']` | `['swapQuote', { amount, from, to }]` | Swap quotes |

## Four Critical Patterns

### 1. Real-time updates (streaming)

Streaming is opt-in. Two requirements: register a provider + mount the watch hook.

```ts
import { createTonCenterStreamingProvider } from '@ton/appkit';

const appKit = new AppKit({
    networks: { /* ... */ },
    providers: [
        createTonCenterStreamingProvider({ network: Network.mainnet(), apiKey: 'KEY' }),
    ],
});
```

```tsx
function BalanceDisplay() {
    const { data: balance } = useBalance();
    useWatchBalance(); // writes WS updates into useBalance cache
    return <p>{balance?.toString()} nanoTON</p>;
}
```

Without **both**, `useBalance` is one-shot. Alternative streaming providers: `createTonApiStreamingProvider`.

### 2. Cache after mutations

Mutations don't auto-invalidate. Use `invalidateQueries` after transfers and `removeQueries` after disconnect:

```tsx
const queryClient = useQueryClient();

// After transfer: invalidate so the next render refetches
useTransferTon({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: ['balance'] }) },
});

// After disconnect: remove entirely so old wallet's data can't flash
useDisconnect({
    mutation: {
        onSuccess: () => {
            ['balance', 'nfts', 'nft', 'jettons', 'jetton-balance', 'jetton-info', 'jetton-wallet-address', 'stakedBalance'].forEach(key =>
                queryClient.removeQueries({ queryKey: [key] }),
            );
        },
    },
});
```

`removeQueries` is correct on disconnect because there's no wallet to refetch for — leaving stale entries would flash the old wallet's data before the new wallet loads.

For a stronger guarantee when wallet switches happen mid-flight (pending tx, hooks holding stale data), wrap wallet-scoped UI with `key={address}` so React remounts the whole subtree on address change:
```tsx
const address = useAddress();
return <WalletScopedUI key={address ?? 'disconnected'} />;
```
This kills any in-flight mutation state, useState, and refs tied to the previous wallet — cleanest fix for "spinner stuck forever after switching wallets". Combine with `removeQueries` on disconnect for the cache layer.

### 3. Transaction confirmation is not instant

`useTransferTon` / `useSendTransaction` resolve when the wallet **accepts** the tx — not when it's confirmed on-chain. Balances won't reflect the change immediately even after `onSuccess`. `data` is `SendTransactionResponse = { boc, normalizedBoc, normalizedHash }` — an **object**, not a bare BOC string. Two patterns:

```tsx
// (a) Drop-in: <TransactionProgress /> tracks the tx until finalized
const { mutate, data } = useTransferTon();
{data && <TransactionProgress boc={data.boc} onSuccess={() => /* now confirmed */} />}

// (b) Hooks: invalidate on accept; the next refetch picks up the new state once on-chain
useTransferTon({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: ['balance'] }) },
});
```

To track a tx by hash (e.g. backend webhook lookup), use `data.normalizedHash`.

Pair with `useWatchBalance()` + streaming if you want the balance to refresh the instant confirmation lands without a manual refetch.

### 4. Transaction error handling

```tsx
const { mutate, isPending, error, reset } = useTransferTon();
const isUserRejection = (err: Error) => /reject|cancel|abort/i.test(err.message);

<button disabled={isPending} onClick={() => mutate(params)}>Send</button>
{error && (
    <>
        <p>{isUserRejection(error) ? 'Cancelled' : `Error: ${error.message}`}</p>
        <button onClick={reset}>Try again</button>
    </>
)}
```

Disable only on `isPending`, not `isError` (button must re-enable so user can retry). Use `reset()` for retry. For swap/staking, `@ton/appkit` exports `DefiError` (with `DefiErrorCode`) for typed handling.

## No-wallet fallback

When the user has no TON wallet installed (no browser extension, no Tonkeeper on the device), `<TonConnectButton />` still works — but the experience changes:

- **On mobile** without Tonkeeper installed, the universal link opens the App Store / Google Play install flow.
- **On desktop** without a browser-extension wallet, TonConnect opens a modal with QR codes — the user scans from their mobile wallet to connect. This is intentional and works without any code from you.

For a custom Connect button, you can detect emptiness via `useConnectors()` and render a fallback CTA:

```tsx
const connectors = useConnectors();
if (connectors.length === 0) {
    return (
        <a href="https://tonkeeper.com/download" target="_blank" rel="noreferrer">
            Install Tonkeeper to continue
        </a>
    );
}
```

But for most apps the right answer is **just use `<TonConnectButton />`** and rely on TonConnect's built-in universal/QR/install-redirect flow — it covers all three cases (extension, mobile-installed, mobile-not-installed → install link, desktop → QR) without you wiring it.

## Common Gotchas

1. **`QueryClientProvider` wraps `AppKitProvider`** — not the other way around. `AppKitProvider` doesn't create its own QueryClient.
2. **`useBalance` returns `bigint`** nanoTON. Divide by `1e9` for TON. `.toString()` at API/storage boundaries (`JSON.stringify` throws on BigInt).
3. **Amounts are strings** (`'0.5'`, not `500000000n`). AppKit applies token decimals internally.
4. **Streaming is opt-in** — needs both a provider in config and `useWatchBalance` mounted.
5. **Network mismatch breaks transactions** — if the connected wallet is on testnet but your `defaultNetwork` is mainnet (or vice versa), TonConnect rejects the tx and your `useTransferTon` mutation lands in `error` with a network-mismatch message. Set `defaultNetwork`, expose switching with `useDefaultNetwork()`, and pass `network` into address-based reads. Check before sending:
    ```tsx
    const walletNetwork = useNetwork();
    const [defaultNetwork] = useDefaultNetwork();
    const networkMismatch = walletNetwork && walletNetwork.chainId !== defaultNetwork.chainId;
    ```
    Mainnet chainId `-239`, testnet `-3`.
6. **iOS deep links need synchronous click** — call `connect()` directly in the handler, no `await` before it (see Wallet section above for the anti-pattern).
7. **Telegram Mini App return** — configure `tonConnectOptions.actionsConfiguration.returnStrategy`.
8. **React 19 / Next 15 hook errors** — check `@tonconnect/ui-react` version + run `pnpm why react` for duplicates.
