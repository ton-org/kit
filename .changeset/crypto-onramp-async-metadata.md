---
'@ton/walletkit': major
'@ton/appkit': major
'@ton/appkit-react': major
---

Make crypto-onramp provider `getMetadata()` async.

- `@ton/walletkit`:
    - `CryptoOnrampProvider.getMetadata()` and `CryptoOnrampProviderInterface.getMetadata()` now return `Promise<CryptoOnrampProviderMetadata>`. Concrete `DecentCryptoOnrampProvider` and `LayerswapCryptoOnrampProvider` updated.
    - `CryptoOnrampManager` gains `getMetadata(providerId?)` proxy with the existing `try/catch + log.debug` pattern.
    - `getSupportedNetworks()` left synchronous — the shared `DefiProvider` base method is unchanged in this branch.
- `@ton/appkit`:
    - New action `getCryptoOnrampProviderMetadata` and matching TanStack query (`getCryptoOnrampProviderMetadataQueryOptions`).
- `@ton/appkit-react`:
    - New hook `useCryptoOnrampProviderMetadata` (wagmi-style `UseQueryResult`).
    - `CryptoOnrampContext` exposes `providersMetadata` (`Record<providerId, metadata | undefined>`) and `isProvidersMetadataLoading`. The settings modal renders providers with per-row `providerId` fallback while metadata resolves — one slow/broken provider does not block the others. The selected provider's name shows a skeleton in the info row until its metadata arrives.
    - `OptionSwitcher` gains a `loading` prop that replaces the trigger content with a `Skeleton`.
