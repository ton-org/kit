---
'@ton/walletkit': patch
'@ton/appkit': patch
'@ton/appkit-react': patch
---

Added gasless transactions support. A relayer pays gas; the user pays a fee in a relayer-accepted asset (e.g. USDT). See [`@ton/appkit/docs/gasless.md`](https://github.com/ton-connect/kit/blob/main/packages/appkit/docs/gasless.md) for a regular-send → gasless-send migration guide.

- `@ton/walletkit`:
    - New `GaslessManager` and `GaslessProvider` abstract base, parallel to `StakingManager` / `SwapManager`.
    - `TonApiGaslessProvider` (`createTonApiGaslessProvider`) — multi-network gasless via the public TonAPI REST API. No external SDK dependency; talks to TonAPI via `fetch`. Auto-discovers networks from the kit when `chains` is omitted; per-chain `apiKey`/`endpoint` overrides supported.
    - Models: `GaslessSupportedAsset`, `GaslessProviderMetadata` (`{ name, logo?, url? }`), `GaslessQuote`, `GaslessQuoteParams` (`feeAsset?: UserFriendlyAddress`), `GaslessSendParams`, `GaslessSendResponse` (strict superset of `SendTransactionResponse` adding `internalBoc`).
    - `GaslessError` + `GaslessErrorCode` enum: `UnsupportedFeeAsset`, `UnsupportedOperation`, `QuoteFailed`, `SendFailed`, `SupportedAssetsFailed`, `SignMessageNotSupported`, `TooManyMessages`.
    - Send retry: 3 retries with exponential backoff on transient errors (5xx / 408 / 429 / network); 4xx fails fast. Wallet seqno guard protects against on-chain double-spend on retry.
    - `WalletAdapter` interface gains `signMessage(request): Promise<SignMessageResponse>` and `getSupportedFeatures(): Feature[] | undefined`.
    - `asAddressFriendly` now re-exported from the package root.
    - `Uint8ArrayToBase64` and `HexToBase64` return types tightened from `string` to `Base64String`.

- `@ton/appkit`:
    - Actions: `getGaslessManager`, `getGaslessProvider`, `getGaslessProviders`, `setDefaultGaslessProvider`, `watchGaslessProviders`, `getGaslessProviderMetadata`, `getGaslessSupportedAssets`, `getGaslessQuote`, `sendGaslessTransaction`.
    - Queries: `getGaslessProviderMetadataQueryOptions`, `getGaslessSupportedAssetsQueryOptions`, `getGaslessQuoteQueryOptions` (2-min `staleTime` matching the relayer `validUntil`), `sendGaslessTransactionMutationOptions`.
    - `sendGaslessTransaction` enforces the wallet's `SignMessage` capability and message cap, throwing `GaslessError(SIGN_MESSAGE_NOT_SUPPORTED)` / `GaslessError(TOO_MANY_MESSAGES)` before submission.
    - New `signMessage` action and `signMessageMutationOptions` (the underlying primitive for gasless signing).
    - `TonConnectWalletAdapter` now implements `signMessage` and `getSupportedFeatures`.
    - `WalletInterface` gains `signMessage` and `getSupportedFeatures`.
    - `asAddressFriendly` re-exported from `@ton/appkit/utils`.

- `@ton/appkit-react`:
    - Hooks: `useGaslessProviderMetadata`, `useGaslessSupportedAssets`, `useGaslessProvider`, `useGaslessProviders`, `useGaslessQuote`, `useSendGaslessTransaction`, `useSignMessage`.
