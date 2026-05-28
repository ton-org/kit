---
'@ton/walletkit': patch
'@ton/appkit': patch
'@ton/appkit-react': patch
---

Added gasless transactions support. A relayer pays the TON gas; the user pays a fee in a relayer-accepted jetton (e.g. USDT). See [`@ton/appkit/docs/gasless.md`](https://github.com/ton-connect/kit/blob/main/packages/appkit/docs/gasless.md) for the regular-send → gasless-send migration guide.

- `@ton/walletkit`:
    - `GaslessManager` and the `GaslessProvider` abstract base — parallel to `StakingManager` / `SwapManager`. Extend `GaslessProvider` to plug in your own relayer.
    - `TonApiGaslessProvider` / `createTonApiGaslessProvider()` — gasless via the TonAPI relayer. Auto-discovers networks from the kit; per-chain `apiKey` / `endpoint` overrides supported.
    - `GaslessError` with `GaslessErrorCode`: `UnsupportedFeeAsset`, `FeeAssetNotOwned`, `UnsupportedOperation`, `QuoteFailed`, `SendFailed`, `ConfigFailed`, `SignMessageNotSupported`, `TooManyMessages`, `QuoteExpired`, `WalletMismatch`.

- `@ton/appkit`:
    - Actions: `getGaslessConfig`, `getGaslessQuote`, `getGaslessJettonTransferQuote`, `sendGaslessTransaction`, `getGaslessProviderMetadata`, plus provider management (`getGaslessManager`, `getGaslessProvider(s)`, `setDefaultGaslessProvider`, `watchGaslessProviders`).
    - `getGaslessJettonTransferQuote` is the recommended entry point: takes `jettonAddress`/`recipientAddress`/`amount`/`feeAsset` and builds the transfer messages for you, routing the jetton `excess` back to the relayer. The two-step quote → `sendGaslessTransaction` flow is preserved.
    - `sendGaslessTransaction` runs fail-fast guards before prompting the wallet — throws `GaslessError(QUOTE_EXPIRED)`, `WALLET_MISMATCH`, `SIGN_MESSAGE_NOT_SUPPORTED`, or `TOO_MANY_MESSAGES` so the user is not asked to sign a quote the relayer would reject.
    - Quote queries are wallet- and network-bound: switching wallet or network refetches a fresh quote instead of serving one issued for the previous wallet.
    - New `signMessage` action (the primitive gasless uses to sign the relayer-wrapped BoC). `TonConnectWalletAdapter` now implements `signMessage` and `getSupportedFeatures`.

- `@ton/appkit-react`:
    - Hooks: `useGaslessConfig`, `useGaslessQuote`, `useGaslessJettonTransferQuote`, `useSendGaslessTransaction`, `useGaslessProviderMetadata`, `useGaslessProvider(s)`, `useSignMessage`. Quote hooks auto-refetch on wallet/network switch.
