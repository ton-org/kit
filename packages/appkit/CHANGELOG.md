# @ton/appkit

## 1.0.0-alpha.4

### Patch Changes

- a588278: Updated @tonconnect dependencies
- 912e0a2: Added gasless transactions support. A relayer pays the TON gas; the user pays a fee in a relayer-accepted jetton (e.g. USDT). See [`@ton/appkit/docs/gasless.md`](https://github.com/ton-connect/kit/blob/main/packages/appkit/docs/gasless.md) for the regular-send → gasless-send migration guide.
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

- Updated dependencies [912e0a2]
    - @ton/walletkit@1.0.0-alpha.4

## 1.0.0-alpha.3

### Patch Changes

- Updated dependencies
    - @ton/walletkit@1.0.0-alpha.3

## 1.0.0-alpha.2

### Patch Changes

- c1f0edf: - Added confirmation modals for the swap and staking widgets.
    - Improved error handling across swap and staking flows, especially when the network is unavailable — failures now surface in the submit button instead of hanging.
    - Moved `cancelPromise` from `@ton/appkit` to `@ton/walletkit` and renamed it to `withTimeout` to reflect what it actually does (it does not abort the underlying operation). `@ton/appkit` re-exports it.
- Updated dependencies [c1f0edf]
- Updated dependencies [864636c]
    - @ton/walletkit@1.0.0-alpha.2

## 1.0.0-alpha.1

### Patch Changes

- f301c66: - `@ton/appkit`: reworked connector events — replaced `CONNECTED`/`DISCONNECTED` with a single `WALLETS_UPDATED` event; TonConnect connector now cleans up the default-network subscription on `destroy` and guards `getTonConnectUI` after destroy
    - `@ton/appkit-react`: removed `BalanceBadge` component and its re-export from `features/balances`
    - `@ton/appkit-react`: fixed decimals handling in `SendJettonButton`
    - `@ton/walletkit`, `@ton/appkit`, `@ton/appkit-react`: unified provider error API — added `DefiErrorCode` and `SwapErrorCode` enums and re-exported them from the package roots; `map-swap-error` and `map-defi-error` updated to use the codes
- Updated dependencies [f301c66]
- Updated dependencies [8704846]
    - @ton/walletkit@1.0.0-alpha.1

## 1.0.0-alpha.0

### Major Changes

- AppKit V1

### Minor Changes

- 70efd43: Add LRU cache to `getJettonInfo` and `getJettonWalletAddress`, and make `jettonDecimals` optional in `useJettonBalanceByAddress`.

    `@ton/appkit` now ships with a built-in LRU cache (10-minute TTL, 1000 entries) used to avoid redundant API calls in `getJettonInfo` and `getJettonWalletAddress`. A custom cache can be provided via the new `cache` option in `AppKitConfig`. The `AppKitCache` interface and `LruAppKitCache` class are exported for custom implementations.

    `jettonDecimals` is now optional in `useJettonBalanceByAddress` and `getJettonBalanceByAddressQueryOptions` — when omitted, decimals are resolved automatically from `getJettonInfo` (using the cache).

    `@ton/walletkit`: `lru-cache` dependency pinned to the workspace catalog version.

- c1f5243: **Staking widget and provider API**

    Breaking changes in `@ton/walletkit`:
    - `getSupportedUnstakeModes()` removed from `StakingProviderInterface` and `StakingProvider`; replaced by `getStakingProviderMetadata(network?)` which returns full static metadata (including unstake modes)
    - `getSupportedNetworks()` added as abstract method to `StakingProvider` — existing custom subclasses must implement it
    - `DefiManagerError` renamed to `DefiError`
    - `lstExchangeRate` renamed to `exchangeRate` in `StakingProviderInfo`
    - `StakingProviderMetadata` shape changed: flat token fields replaced with `stakeToken: StakingTokenInfo` and optional `receiveToken?: StakingTokenInfo`

    Breaking changes in `@ton/appkit`:
    - `getStakingProviders()` return type changed from `string[]` to `StakingProviderInterface[]`

    New in `@ton/walletkit`:
    - Added `StakingTokenInfo` type (exported)
    - `contractAddress` is now optional in `StakingProviderMetadata` (for custodial providers)
    - Added `isReversed` to `StakingQuoteParams` for reversed unstake quotes
    - `TonStakersStakingProvider` accepts `metadataOverride` in config; constructor deep-merges overrides with defaults
    - `BaseProvider` moved from `interfaces` to `models/core` and re-exported
    - Added `TokenAddress` type (`'ton' | UserFriendlyAddress`)
    - `StakingErrorCode` now exported
    - `DefiError.UNSUPPORTED_NETWORK` error code added
    - `StakingManager`, `StakingProvider`, `StakingError` are now value exports (not only type exports)

    New in `@ton/appkit`:
    - Added actions: `getStakingProvider`, `getStakingProviderMetadata`, `watchStakingProviders`
    - Added utilities: `truncateDecimals`, `calcMaxSpendable`
    - `StakingProviderMetadata` and `StakingTokenInfo` now exported from `@ton/appkit`

    New in `@ton/appkit-react`:
    - Added `StakingWidget` — full stake/unstake UI with reversed quotes, balance display, and unstake mode selector
    - New components: `StakingWidgetProvider`, `StakingWidgetUi`, `StakingInfo`, `StakingBalanceBlock`, `SelectUnstakeMode`
    - New hooks: `useStakingProvider`, `useStakingProviders`, `useStakingProviderInfo`, `useStakingProviderMetadata`, `useStakingQuote`, `useBuildStakeTransaction`, `useStakedBalance`
    - Added English localizations for all staking UI strings

- c1f5243: **Swap widget and provider API**

    Breaking changes in `@ton/walletkit`:
    - `DefiManagerError` renamed to `DefiError`; update any `catch (e instanceof DefiManagerError)` or direct import
    - `SwapFee` type removed; `fee` field removed from `SwapQuote`
    - `getSupportedNetworks()` and `getMetadata()` added as abstract methods to `SwapProvider` — existing custom provider subclasses must implement them

    New in `@ton/walletkit`:
    - Added `SwapProviderMetadata` and `SwapProviderMetadataOverride` types
    - `getMetadata()` on `SwapProviderInterface` returns static display info (name, logo, URL)
    - `getSupportedNetworks()` on `SwapProviderInterface` returns supported networks
    - `DeDustSwapProvider` and `OmnistonSwapProvider` expose metadata; both accept `metadataOverride` in config
    - `getProviders()` replaces `getRegisteredProviders()` — returns `SwapProviderInterface[]` instead of `string[]`
    - `removeProvider()` added to `DefiManagerAPI`
    - Re-registering a provider with an existing id now replaces it instead of throwing
    - `DefiError.UNSUPPORTED_NETWORK` error code added
    - `SwapError`, `SwapManager`, `SwapProvider` are now value exports (not only type exports)
    - Providers emit `provider:registered` and `provider:default-changed` events on `AppKit`'s event emitter

    New in `@ton/appkit`:
    - Added actions: `getSwapProvider`, `getSwapProviders`, `watchSwapProviders`, `setDefaultSwapProvider`
    - `getSwapQuote` now resolves the active network automatically when `network` is omitted
    - Added utilities: `calcFiatValue`, `formatLargeValue`, `debounce`, `calcMaxSpendable`, `getTonShortfall`

    New in `@ton/appkit-react`:
    - Added `SwapWidget` — full-featured swap UI with token selection, amount input, slippage settings, provider picker, and top-up flow
    - New components: `SwapField`, `SwapFlipButton`, `SwapInfo`, `SwapSettingsButton`, `SwapSettingsModal`, `SwapTokenSelectModal`, `SwapWidgetProvider`, `SwapWidgetUi`
    - New hooks: `useSwapProvider`, `useSwapProviders`, `useSwapQuote`, `useBuildSwapTransaction`
    - Added generic `LowBalanceModal` component (shared with staking widget)
    - New utility hooks: `useDebounceCallback`, `useDebounceValue`, `useUnmount`
    - New shared components: `Input`, `Modal`, `Dialog`, `Skeleton`, `Tabs`, `InfoBlock`, `Collapsible`, `CenteredAmountInput`, `AmountPresets`, `TokenSelectModal`, `Logo`, `AmountReversed`
    - Added `AppKitUIToken` type for CSS custom property tokens
    - `useAppKit`, `useAppKitTheme`, `useI18n` moved to `features/settings` (still re-exported from the package root — no import path change needed)
    - `CircleIcon` renamed to `Logo` with an extended API; replace `<CircleIcon src=... />` with `<Logo src=... />`
    - Added English localizations for all swap UI strings

### Patch Changes

- fd7e89f: Added support for new TonConnect features: SignMessage, StructeredItems, EmbeddedRequests
- 5b75f27: - `@ton/appkit`:
    - added `getSwapProvider` and `watchSwapProviders` actions
    - added swap-related events and types to `AppKit` core
    - added `calcFiatValue` and `formatLargeValue` amount utilities
    - added `debounce` utility function
    - `@ton/walletkit`:
        - added `SwapProviderMetadata` interface
        - added `getMetadata()` method to `SwapProvider`
        - added metadata support to `DeDustSwapProvider` and `OmnistonSwapProvider`
    - `@ton/appkit-react`:
        - added `SwapWidget` and related UI components (`SwapField`, `SwapSettings`, `TokenSelector`, etc.)
        - added `SwapWidgetProvider` for swap state management
        - added hooks for swap: `useSwapProvider`, `useSwapQuote`, `useBuildSwapTransaction`
        - added `useDebounceCallback`, `useDebounceValue`, and `useUnmount` utility hooks
        - added English localizations for swap features
- 50c5bf3: - `@ton/walletkit`:
    - refactored `StakingProviderMetadata`: flat token fields replaced with `stakeToken: StakingTokenInfo` object and optional `receiveToken?: StakingTokenInfo` group to support both liquid and custodial staking providers
    - made `contractAddress` optional in `StakingProviderMetadata` for custodial providers without on-chain contracts
    - renamed `lstExchangeRate` to `exchangeRate` in `StakingProviderInfo`
    - added `StakingTokenInfo` type export
    - added `isReversed` parameter to `StakingQuoteParams` for reversed unstake quotes
    - added deep-merge support for metadata overrides in `TonStakersStakingProvider` constructor
    - added `getStakingProvider` and `watchStakingProviders` to `DefiManager`
    - `@ton/appkit`:
        - added `getStakingProviderMetadata`, `getStakingProvider`, and `watchStakingProviders` actions
        - added `truncateDecimals` and `formatLargeValue` amount utilities
        - exported `StakingTokenInfo` type
    - `@ton/appkit-react`:
        - added `StakingWidget` with full stake/unstake UI, balance display, reversed quotes, and unstake mode selector
        - updated base design tokens to TonConnect colors
        - added staking hooks and i18n translations
- c67bb0e: Added emulation support to the TonAPI client and introduced provider-agnostic emulation domain models under `api/models/emulation` (`EmulationResult`, `EmulationResponse`, `EmulationTransaction`, `EmulationMessage`, `EmulationAction`, `EmulationTraceNode`, `EmulationAddressBookEntry`). `ApiClient.fetchEmulation` now returns `EmulationResult` instead of the toncenter-specific `ToncenterEmulationResult`, so callers get the same shape regardless of backend. Reorganized toncenter raw types under `clients/toncenter/types/*` (NFTs, jettons, DNS, metadata, raw emulation), moved the `ApiClient` interface to `api/interfaces`, removed legacy emulation parsing utilities (`utils/toncenterEmulation`, message/jetton parser handlers), and migrated optional NFT and DNS results from `null` to `undefined` across walletkit, appkit, and mcp.
- Updated dependencies [db5c23b]
- Updated dependencies [70efd43]
- Updated dependencies [fd7e89f]
- Updated dependencies [db5c23b]
- Updated dependencies [5b75f27]
- Updated dependencies [50c5bf3]
- Updated dependencies [c1f5243]
- Updated dependencies [c1f5243]
- Updated dependencies [c67bb0e]
    - @ton/walletkit@1.0.0-alpha.4

## 0.0.5-alpha.3

### Patch Changes

- Updated dependencies [0042cc9]
    - @ton/walletkit@0.0.12-alpha.3

## 0.0.5-alpha.2

### Patch Changes

- 1f552f7: Added new connector and provider factory options
- 4a060fb: Implemented staking infrastructure including \`StakingManager\` and \`TonStakersStakingProvider\` with support for multiple unstake modes (delayed, instant, best rate). Added core type updates and exported staking features from the package root.
- Updated dependencies [74e0b78]
- Updated dependencies [1f552f7]
- Updated dependencies [4a060fb]
    - @ton/walletkit@0.0.12-alpha.2

## 0.0.5-alpha.1

### Patch Changes

- Updated dependencies
    - @ton/walletkit@0.0.12-alpha.1

## 0.0.5-alpha.0

### Patch Changes

- Updated dependencies [494250e]
    - @ton/walletkit@0.0.12-alpha.0

## 0.0.4

### Patch Changes

- babd2af: Implemented and improved multiple methods in `ApiClientTonApi`: `jettonsByOwnerAddress`, `nftItemsByAddress`, `nftItemsByOwner`, `runGetMethod`, `getAccountTransactions`, `getTransactionsByHash`, `getTrace`, `getPendingTrace`, `getEvents`, and `getMasterchainInfo`.
- 29d0d22: Updated `SwapQuote` and `SwapQuoteParams` types: changed `amount`, `fromAmount`, `toAmount`, and `minReceived` from `TokenAmount` to `string`. This change was made because these fields now contain values already formatted into a human-readable format, whereas `TokenAmount` is intended for nano amounts.
- 72930db: - Add `getMasterchainInfo` to `ApiClient`, currently implemented in `ApiClientToncenter` and `ApiClientTonApi`.
    - Add `getBlockNumber` action to `@ton/appkit`.
    - Add `useBlockNumber` hook to `@ton/appkit-react`.
- Updated dependencies [babd2af]
- Updated dependencies [29d0d22]
- Updated dependencies [79e00db]
- Updated dependencies [7491d5e]
- Updated dependencies [fa55b70]
- Updated dependencies [72930db]
    - @ton/walletkit@0.0.11

## 0.0.4-alpha.2

### Patch Changes

- 72930db: - Add `getMasterchainInfo` to `ApiClient`, currently implemented in `ApiClientToncenter` and `ApiClientTonApi`.
    - Add `getBlockNumber` action to `@ton/appkit`.
    - Add `useBlockNumber` hook to `@ton/appkit-react`.
- Updated dependencies [72930db]
    - @ton/walletkit@0.0.11-alpha.2

## 0.0.4-alpha.1

### Patch Changes

- Updated dependencies
    - @ton/walletkit@0.0.11-alpha.1

## 0.0.4-alpha.0

### Patch Changes

- Updated dependencies
    - @ton/walletkit@0.0.11-alpha.0

## 0.0.3

### Patch Changes

- 3337750: - Added support for Tetra network and `ApiClientTonApi` implementation for WalletKit.
    - Added `getDefaultNetwork`, `setDefaultNetwork` and `watchDefaultNetwork` in AppKit.
    - Added `useDefaultNetwork` and `useNetworks` hooks in `@ton/appkit-react`.
    - Internal refactoring in WalletKit API clients via abstract `BaseApiClient`.
    - `ApiClient` `sendBoc` now returns Hex strings (`0x`).
    - Fixed infinite re-render in `useNetworks` hook.
    - It is now possible to subscribe to `defaultNetwork` updates via the internal event bus (`emitter`).
    - Updated `TonConnectConnector` to natively subscribe to `NETWORKS_EVENTS.DEFAULT_CHANGED` for automatic network switching.
- 7d7398a: Renamed useNFTsByAddress to useNftsByAddress
- Updated dependencies [3337750]
- Updated dependencies [9c1a73d]
    - @ton/walletkit@0.0.10

## 0.0.2

### Patch Changes

- ac2a290: Add possibility to get transaction status by boc or hash. Added 0x prefix for hash from ApiClient.sendBoc
- Updated dependencies [97e06e7]
- Updated dependencies [ac2a290]
    - @ton/walletkit@0.0.9

## 0.0.1

### Patch Changes

- Alpha release
