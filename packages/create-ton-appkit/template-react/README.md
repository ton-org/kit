# TON AppKit Template

Minimal Vite + React + TypeScript template that showcases the core capabilities of `@ton/appkit-react`:

- TonConnect wallet connection — `<TonConnectButton />`
- Live TON balance over WebSocket — `useBalance()` + `useWatchBalance()`
- Send TON (safe self-transfer demo) — `<SendTonButton />`
- Jetton list with icons + balances — `useJettons()`
- NFT grid — `useNfts()` + `<NftItem />`
- Full DEX swap UI (Omniston + DeDust fallback) — `<SwapWidget />`
- Liquid staking UI (Tonstakers) — `<StakingWidget />`

## Run

```bash
pnpm install
pnpm dev
```

Optional: add a TonCenter API key to `.env` (`VITE_TONCENTER_API_KEY`) — recommended for everything,
required for Tonstakers.

Other scripts: `pnpm build`, `pnpm typecheck`, `pnpm lint`, `pnpm preview`.

## Configure

All runtime config is in `.env` (created from the template) and `src/appKit.ts`.

- **`VITE_TONCENTER_API_KEY`** — free key at <https://docs.ton.org/applications/api/toncenter/get-api-key>. Required for
  Tonstakers (polls ~1×/sec); recommended for everything else.
- **`VITE_TONCONNECT_MANIFEST_URL`** — optional override. Defaults to
  `${origin}/tonconnect-manifest.json`. For prod, update the placeholder in `public/tonconnect-manifest.json`.

## Documentation

- [Applications overview](https://docs.ton.org/applications/apps-overview)
- [AppKit overview](https://docs.ton.org/applications/appkit/overview)
- [Set up AppKit](https://docs.ton.org/applications/appkit/howto/appkit)
- [Connect to a wallet](https://docs.ton.org/applications/appkit/howto/connect-to-a-wallet)
- [Read balances](https://docs.ton.org/applications/appkit/howto/read-balances)
- [Send Toncoin](https://docs.ton.org/applications/appkit/howto/send-toncoin)
- [Send jettons](https://docs.ton.org/applications/appkit/howto/send-jettons)
- [Manage NFTs](https://docs.ton.org/applications/appkit/howto/nfts)
- [Perform swaps](https://docs.ton.org/applications/appkit/howto/swaps)
- [Stake and unstake](https://docs.ton.org/applications/appkit/howto/staking)
- [Use streaming](https://docs.ton.org/applications/appkit/howto/streaming)
- [Use providers](https://docs.ton.org/applications/appkit/howto/providers)
- [Use UI widgets](https://docs.ton.org/applications/appkit/howto/use-ui-widgets)
- [TonConnect](https://docs.ton.org/applications/ton-connect/overview)

## Project layout

```
src/
  main.tsx                    # entry, mounts <App />
  App.tsx                     # root component with Providers
  Providers.tsx               # QueryClientProvider + AppKitProvider + styles.css
  appKit.ts                   # AppKit config: networks, connectors, providers
  components/
    Header.tsx                # app header with TonConnectButton
    BalanceCard.tsx           # TON balance display + send button
    JettonsCard.tsx           # jetton list
    NftsCard.tsx              # NFT grid
    SwapCard.tsx              # swap widget with error handling
    StakingCard.tsx           # staking widget
  utils/
    format.ts                 # shared token amount formatting
  polyfills.ts                # Buffer polyfill for @ton/core
```
