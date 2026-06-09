---
'@ton/walletkit': patch
'@ton/appkit': patch
'@ton/appkit-react': patch
---

Added gasless transactions support. A relayer pays the TON gas; the user pays a fee in a relayer-accepted jetton (e.g. USDT). See [`@ton/appkit/docs/gasless.md`](https://github.com/ton-connect/kit/blob/main/packages/appkit/docs/gasless.md) for the regular-send → gasless-send migration guide.

- `@ton/walletkit`:
    - `GaslessManager` and the `GaslessProvider` abstract base — parallel to `StakingManager` / `SwapManager`. Extend `GaslessProvider` to plug in your own relayer.
    - `TonApiGaslessProvider` / `createTonApiGaslessProvider()` — gasless via the TonAPI relayer. Auto-discovers networks from the kit; per-chain `apiKey` / `endpoint` overrides supported.
    - `GaslessError` with `GaslessErrorCode`: `UnsupportedOperation`, `QuoteFailed`, `SendFailed`, `ConfigFailed`, `SignMessageNotSupported`, `TooManyMessages`, `QuoteExpired`, `WalletMismatch`.
    - `TonApiGaslessProvider` retries transient (5xx / network) failures for both quote and send — configurable via `quoteRetries` / `quoteRetryDelayMs` and `sendRetries` / `sendRetryDelayMs` on `createTonApiGaslessProvider`.
    - Wallet-feature helpers: `hasSignMessageSupport(features)` (whether a wallet's advertised features include `SignMessage`, the capability gasless requires) and `getMaxOutgoingMessages(features, featureName?)` — now takes an optional feature name so it reads the `maxMessages` cap of either `SendTransaction` (default) or `SignMessage`.

- `@ton/appkit`:
    - Actions: `getGaslessConfig`, `getGaslessQuote`, `getGaslessJettonTransferQuote`, `sendGaslessTransaction`, `getGaslessProviderMetadata`, plus provider management (`getGaslessManager`, `getGaslessProvider(s)`, `setDefaultGaslessProvider`, `watchGaslessProviders`).
    - `getGaslessJettonTransferQuote` is a convenience wrapper: takes `jettonAddress`/`recipientAddress`/`amount`/`feeAsset` and builds the transfer messages for you, routing the jetton `excess` back to the relayer. The two-step quote → `sendGaslessTransaction` flow is preserved.
    - `sendGaslessTransaction` runs fail-fast guards before prompting the wallet — throws `GaslessError(QUOTE_EXPIRED)`, `WALLET_MISMATCH`, `SIGN_MESSAGE_NOT_SUPPORTED`, or `TOO_MANY_MESSAGES` so the user is not asked to sign a quote the relayer would reject.
    - Quote queries are wallet- and network-bound: switching wallet or network refetches a fresh quote instead of serving one issued for the previous wallet.
    - New `signMessage` action — signs a transaction-shaped request without broadcasting, returning a signed BoC a relayer can submit on-chain (the same `signMessage` primitive the gasless flow signs with). `TonConnectWalletAdapter` now implements `signMessage` and `getSupportedFeatures`.
    - `getSignMessageSupport` / `watchSignMessageSupport` actions — whether the selected wallet supports `SignMessage`, for gating the gasless UI (fail-closed when no wallet is connected).

- `@ton/appkit-react`:
    - Hooks: `useGaslessConfig`, `useGaslessQuote`, `useGaslessJettonTransferQuote`, `useSendGaslessTransaction`, `useGaslessProviderMetadata`, `useGaslessProvider(s)`, `useSignMessage`. Quote hooks auto-refetch on wallet/network switch.
    - `useSignMessageSupport` hook — reactive check whether the selected wallet supports `SignMessage` (gates the gasless toggle/UI; re-evaluates on wallet switch).
