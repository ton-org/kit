# @ton/appkit-react

## 1.1.0-beta.0

### Minor Changes

- 68f4abb: Add crypto-onramp support — bridging another chain's crypto into a TON-side asset (e.g. ETH on Arbitrum → USDT on TON) through pluggable providers.

    **@ton/walletkit**

    - `CryptoOnrampManager` — registers, switches and delegates to crypto-onramp providers with a unified API: `getQuote`, `createDeposit`, `getStatus`, `getSupportedCurrencies`, and synchronous `getMetadata`.
    - `CryptoOnrampProvider` abstract base + `CryptoOnrampProviderInterface` for custom providers.
    - Two built-in providers: **Layerswap** and **Decent** (formerly Swaps.xyz), each with configurable supported chains and currencies.
    - Models: `CryptoOnrampQuote`, `CryptoOnrampDeposit`, `CryptoOnrampStatus`, `CryptoOnrampSourceCurrency` / `CryptoOnrampDestinationCurrency`, `CryptoOnrampSupportedCurrencies`, and `CryptoOnrampProviderMetadata` (carries `refundAddressMode` — `off` / `optional` / `required` — and `isReversedAmountSupported`). CAIP-2 chain identifiers via `Caip2ByNetwork`.
    - Currency addresses are normalized to canonical sentinels — `'native'` for a source chain's native coin and `'ton'` for native Toncoin (surfaced as GRAM); each provider translates them to its own API form internally.
    - Errors surface as `CryptoOnrampError` / `CryptoOnrampErrorCode`.

    **@ton/appkit**

    - Actions: `getCryptoOnrampProvider`, `getCryptoOnrampProviders`, `watchCryptoOnrampProviders`, `setDefaultCryptoOnrampProvider`, `getCryptoOnrampQuote`, `createCryptoOnrampDeposit`, `getCryptoOnrampStatus`, `getCryptoOnrampSupportedCurrencies`, `getCryptoOnrampProviderMetadata`.
    - Matching TanStack Query helpers for quote, status and supported currencies, plus a deposit mutation.
    - Built-in providers ship as tree-shakeable subpath imports: `@ton/appkit/crypto-onramp/layerswap` (`createLayerswapProvider`) and `@ton/appkit/crypto-onramp/decent` (`createDecentProvider`).

    **@ton/appkit-react**

    - `CryptoOnrampWidget` — a drop-in buy flow, with the headless `CryptoOnrampWidgetProvider` / context for fully custom UIs. Covers token + payment-method selection with network filters, amount input (with reversed/target-amount entry where the provider supports it), live quote, deposit address + status polling, a refund-address modal driven by the provider's `refundAddressMode`, a provider settings modal, and empty/loading states.
    - Hooks: `useCryptoOnrampProviders`, `useCryptoOnrampProvider`, `useCryptoOnrampProviderById`, `useCryptoOnrampQuote`, `useCreateCryptoOnrampDeposit`, `useCryptoOnrampStatus`, `useCryptoOnrampSupportedCurrencies`, `useCryptoOnrampProviderMetadata`.

- 438588e: Add support for custom providers — third-party providers (`type: 'custom'`) that expose their own methods rather than an SDK-defined API. Register one with `registerProvider`, then retrieve it by id; pass the expected type as a generic argument to narrow the result.

    **@ton/walletkit**

    - New `CustomProvidersManager` (keyed by `providerId`) and the `CustomProvider` interface, both exported from the package root.
    - Custom providers are registered through the existing `registerProvider` flow and reachable via the `customProviders` getter on the kit.
    - `getProvider<T extends CustomProvider>(id)` returns the registered provider (or `undefined`), narrowed to `T`.

    **@ton/appkit**

    - New `getCustomProvider(appKit, { id })` action, returning the provider narrowed to the generic type argument, and `watchCustomProviders(appKit, { onChange })` to react to registrations.
    - Re-exports the `CustomProvider` type and exposes `customProvidersManager` on `AppKit`.

    **@ton/appkit-react**

    - New `useCustomProvider<T>(id)` hook — reads a custom provider by id and re-renders when custom providers are registered.

- f04e34f: Expose advanced transfer parameters on the jetton, NFT and TON transfer actions (and their hooks `useTransferJetton` / `useTransferNft`).

    - **Jetton transfer** (`transferJetton` / `createTransferJettonTransaction`): added `queryId`, `forwardAmount`, `forwardPayload`, `customPayload` and `gasAmount`. A raw `forwardPayload` takes priority over `comment`.
    - **NFT transfer** (`transferNft` / `createTransferNftTransaction`): added `queryId`, `forwardAmount`, `forwardPayload`, `customPayload` and `responseDestination`, with the same `forwardPayload` / `comment` precedence.
    - **TON transfer** (`createTransferTonTransaction`): added `extraCurrency`.

    All new fields are optional — omitting them preserves the previous behaviour. Payload fields (`forwardPayload`, `customPayload`) are Base64-encoded cells; `queryId`, `forwardAmount` and `gasAmount` are nanoton / uint strings. `mode` is intentionally not exposed (it is not carried over TonConnect).

    **BREAKING:** the NFT transfer `amount` field is renamed to `gasAmount` — the TON (in nanotons) attached for gas — to remove the ambiguity with a token quantity and to match the jetton transfer. Replace `{ amount }` with `{ gasAmount }` in `createTransferNftTransaction` / `transferNft` / `useTransferNft` calls.

### Patch Changes

- 82fa071: Rebrand the native asset display from TON to GRAM across the libraries. Technical identifiers are unchanged for backward compatibility — the `'ton'` token address, `AssetType.ton`, the `"TON"` selector / returned symbols in the MCP tools, field names, locale keys, and the SDK branding ("TON AppKit", TON Connect) are kept.

    **@ton/walletkit**

    - The native token's `TokenInfo` / jetton metadata now reports `name: 'Gram'` and `symbol: 'GRAM'`.
    - The Tonstakers staking provider's stake token is renamed: `stakeToken.ticker` is now `'GRAM'` (was `'TON'`) in both the mainnet and testnet metadata. The token `address` (`'ton'`) and the receive token (`tsTON` / `TUNA`) are unchanged.
    - Human-readable transaction previews now read "Gram Transfer", and amounts are labelled `GRAM` (e.g. `1.5 GRAM`) instead of `TON`.
    - Also dropped the unused `HumanReadableTx` type from the public exports.

    All widgets and components now present the native asset as GRAM instead of TON:

    - Balance "Send" labels and the shared low-balance modal read GRAM ("Not enough GRAM", with matching reduce / top-up / gasless messages).
    - The staking widget shows GRAM as the native stake token (its ticker comes from the updated `@ton/walletkit` Tonstakers metadata).
    - The native-asset icon is now the GRAM mark: added `GramIconCircle` and a `--ta-color-gram` token, rendered by the amount preview and staking balance block. The `TonIcon` / `TonIconCircle` components are kept.
    - JSDoc on the swap/staking widget context types (providers) and on the `AppkitUIToken` type now refers to GRAM (documentation only — no API or behavior change).

    **@ton/mcp**

    - Tool descriptions and output labels now read GRAM (e.g. "Send GRAM", "Get GRAM balance", amounts rendered as "1.5 GRAM"); raw-unit wording now reads "nano units" instead of "nanoTON".
    - The tool API is unchanged: the `"TON"` token selector, returned token symbols, and the `nanoTon` output field stay the same.

- Updated dependencies [68f4abb]
- Updated dependencies [438588e]
- Updated dependencies [f04e34f]
    - @ton/appkit@1.1.0-beta.0

## 1.0.0

### Major Changes

- 7150e2b: AppKit V1

### Minor Changes

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

- 46cbfb2: Changed z-index from 1000 to 900 in Modal component
- f301c66: - `@ton/appkit`: reworked connector events — replaced `CONNECTED`/`DISCONNECTED` with a single `WALLETS_UPDATED` event; TonConnect connector now cleans up the default-network subscription on `destroy` and guards `getTonConnectUI` after destroy
    - `@ton/appkit-react`: removed `BalanceBadge` component and its re-export from `features/balances`
    - `@ton/appkit-react`: fixed decimals handling in `SendJettonButton`
    - `@ton/walletkit`, `@ton/appkit`, `@ton/appkit-react`: unified provider error API — added `DefiErrorCode` and `SwapErrorCode` enums and re-exported them from the package roots; `map-swap-error` and `map-defi-error` updated to use the codes
- c1f0edf: - Added confirmation modals for the swap and staking widgets.
    - Improved error handling across swap and staking flows, especially when the network is unavailable — failures now surface in the submit button instead of hanging.
    - Moved `cancelPromise` from `@ton/appkit` to `@ton/walletkit` and renamed it to `withTimeout` to reflect what it actually does (it does not abort the underlying operation). `@ton/appkit` re-exports it.
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

- fd7e89f: Added support for new TonConnect features: SignMessage, StructeredItems, EmbeddedRequests
- d411dff: Renamed `Transaction` component to `Send` and updated all associated types and hooks:
    - `Transaction` → `Send`
    - `TransactionProps` → `SendProps`
    - `TransactionRenderProps` → `SendRenderProps`
    - `TransactionRequest` → `SendRequest`
    - `TransactionProvider` → `SendProvider`
    - `TransactionContext` → `SendContext`
    - `TransactionContextType` → `SendContextType`
    - `TransactionProviderProps` → `SendProviderProps`
    - `useTransactionContext` → `useSendContext`

- 1f552f7: Added new connector and provider factory options
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
- 4a060fb: Implemented staking infrastructure including \`StakingManager\` and \`TonStakersStakingProvider\` with support for multiple unstake modes (delayed, instant, best rate). Added core type updates and exported staking features from the package root.
- Updated dependencies [7150e2b]
- Updated dependencies [f301c66]
- Updated dependencies [c1f0edf]
- Updated dependencies [a588278]
- Updated dependencies [912e0a2]
- Updated dependencies [70efd43]
- Updated dependencies [fd7e89f]
- Updated dependencies [1f552f7]
- Updated dependencies [5b75f27]
- Updated dependencies [50c5bf3]
- Updated dependencies [c1f5243]
- Updated dependencies [c1f5243]
- Updated dependencies [c67bb0e]
- Updated dependencies [4a060fb]
    - @ton/appkit@1.0.0

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

- Updated dependencies [a588278]
- Updated dependencies [912e0a2]
    - @ton/appkit@1.0.0-alpha.4

## 1.0.0-alpha.3

### Patch Changes

- @ton/appkit@1.0.0-alpha.3

## 1.0.0-alpha.2

### Patch Changes

- c1f0edf: - Added confirmation modals for the swap and staking widgets.
    - Improved error handling across swap and staking flows, especially when the network is unavailable — failures now surface in the submit button instead of hanging.
    - Moved `cancelPromise` from `@ton/appkit` to `@ton/walletkit` and renamed it to `withTimeout` to reflect what it actually does (it does not abort the underlying operation). `@ton/appkit` re-exports it.
- Updated dependencies [c1f0edf]
    - @ton/appkit@1.0.0-alpha.2

## 1.0.0-alpha.1

### Patch Changes

- 46cbfb2: Changed z-index from 1000 to 900 in Modal component
- f301c66: - `@ton/appkit`: reworked connector events — replaced `CONNECTED`/`DISCONNECTED` with a single `WALLETS_UPDATED` event; TonConnect connector now cleans up the default-network subscription on `destroy` and guards `getTonConnectUI` after destroy
    - `@ton/appkit-react`: removed `BalanceBadge` component and its re-export from `features/balances`
    - `@ton/appkit-react`: fixed decimals handling in `SendJettonButton`
    - `@ton/walletkit`, `@ton/appkit`, `@ton/appkit-react`: unified provider error API — added `DefiErrorCode` and `SwapErrorCode` enums and re-exported them from the package roots; `map-swap-error` and `map-defi-error` updated to use the codes
- Updated dependencies [f301c66]
    - @ton/appkit@1.0.0-alpha.1

## 1.0.0-alpha.0

### Major Changes

- AppKit V1

### Minor Changes

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
- Updated dependencies
- Updated dependencies [70efd43]
- Updated dependencies [fd7e89f]
- Updated dependencies [5b75f27]
- Updated dependencies [50c5bf3]
- Updated dependencies [c1f5243]
- Updated dependencies [c1f5243]
- Updated dependencies [c67bb0e]
    - @ton/appkit@1.0.0-alpha.4

## 0.0.6-alpha.3

### Patch Changes

- @ton/appkit@0.0.5-alpha.3

## 0.0.6-alpha.2

### Patch Changes

- d411dff: Renamed `Transaction` component to `Send` and updated all associated types and hooks:
    - `Transaction` → `Send`
    - `TransactionProps` → `SendProps`
    - `TransactionRenderProps` → `SendRenderProps`
    - `TransactionRequest` → `SendRequest`
    - `TransactionProvider` → `SendProvider`
    - `TransactionContext` → `SendContext`
    - `TransactionContextType` → `SendContextType`
    - `TransactionProviderProps` → `SendProviderProps`
    - `useTransactionContext` → `useSendContext`

- 1f552f7: Added new connector and provider factory options
- 4a060fb: Implemented staking infrastructure including \`StakingManager\` and \`TonStakersStakingProvider\` with support for multiple unstake modes (delayed, instant, best rate). Added core type updates and exported staking features from the package root.
- Updated dependencies [1f552f7]
- Updated dependencies [4a060fb]
    - @ton/appkit@0.0.5-alpha.2

## 0.0.6-alpha.1

### Patch Changes

- @ton/appkit@0.0.5-alpha.1

## 0.0.6-alpha.0

### Patch Changes

- @ton/appkit@0.0.5-alpha.0

## 0.0.5

### Patch Changes

- babd2af: Implemented and improved multiple methods in `ApiClientTonApi`: `jettonsByOwnerAddress`, `nftItemsByAddress`, `nftItemsByOwner`, `runGetMethod`, `getAccountTransactions`, `getTransactionsByHash`, `getTrace`, `getPendingTrace`, `getEvents`, and `getMasterchainInfo`.
- 29d0d22: Updated `SwapQuote` and `SwapQuoteParams` types: changed `amount`, `fromAmount`, `toAmount`, and `minReceived` from `TokenAmount` to `string`. This change was made because these fields now contain values already formatted into a human-readable format, whereas `TokenAmount` is intended for nano amounts.
- 72930db: - Add `getMasterchainInfo` to `ApiClient`, currently implemented in `ApiClientToncenter` and `ApiClientTonApi`.
    - Add `getBlockNumber` action to `@ton/appkit`.
    - Add `useBlockNumber` hook to `@ton/appkit-react`.
- Updated dependencies [babd2af]
- Updated dependencies [29d0d22]
- Updated dependencies [72930db]
    - @ton/appkit@0.0.4

## 0.0.5-alpha.2

### Patch Changes

- 72930db: - Add `getMasterchainInfo` to `ApiClient`, currently implemented in `ApiClientToncenter` and `ApiClientTonApi`.
    - Add `getBlockNumber` action to `@ton/appkit`.
    - Add `useBlockNumber` hook to `@ton/appkit-react`.
- Updated dependencies [72930db]
    - @ton/appkit@0.0.4-alpha.2

## 0.0.5-alpha.1

### Patch Changes

- @ton/appkit@0.0.4-alpha.1

## 0.0.5-alpha.0

### Patch Changes

- @ton/appkit@0.0.4-alpha.0

## 0.0.4

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
- Updated dependencies [7d7398a]
    - @ton/appkit@0.0.3

## 0.0.3

### Patch Changes

- ac2a290: Add possibility to get transaction status by boc or hash. Added 0x prefix for hash from ApiClient.sendBoc
- Updated dependencies [ac2a290]
    - @ton/appkit@0.0.2

## 0.0.1

### Patch Changes

- Alpha release
