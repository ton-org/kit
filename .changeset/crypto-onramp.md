---
'@ton/walletkit': minor
'@ton/appkit': minor
'@ton/appkit-react': minor
---

Add crypto-onramp support — bridging another chain's crypto into a TON-side asset (e.g. ETH on Arbitrum → USDT on TON) through pluggable providers.

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
