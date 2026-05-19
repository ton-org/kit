---
'@ton/walletkit': major
'@ton/appkit': major
'@ton/appkit-react': major
---

Make swap and staking provider metadata / supported-networks methods async.

- `@ton/walletkit`:
    - `SwapProvider.getMetadata()` and `SwapProvider.getSupportedNetworks()` now return `Promise`.
    - `StakingProvider.getStakingProviderMetadata()` and `StakingProvider.getSupportedNetworks()` now return `Promise`.
    - `DefiProvider.getSupportedNetworks()` (base interface) now returns `Promise`.
    - `SwapManager` gains `getMetadata(providerId?)` and `getSupportedNetworks(providerId?)`.
    - `StakingManager` gains `getSupportedNetworks(providerId?)`. The existing `getStakingProviderMetadata` is now async. All manager-level methods follow the existing `try/catch + log.debug` pattern.
    - `SwapAPI` and `StakingAPI` interfaces updated to match.
    - New model types: `SwapProviderWithMetadata` and `StakingProviderWithMetadata` — pair-shapes used by widget UIs to join a provider with its metadata.
- `@ton/appkit`:
    - `getStakingProviderMetadata` action is now async (returns `Promise<StakingProviderMetadata>`).
    - New actions: `getSwapProviderMetadata`, `getSwapSupportedNetworks`, `getStakingSupportedNetworks`.
    - New TanStack queries for each of the new and async-fied actions.
- `@ton/appkit-react`:
    - `useStakingProviderMetadata` now returns a `UseQueryResult` (wagmi-style) instead of `StakingProviderMetadata | undefined`. Consumers must read `data` from the result.
    - New hooks: `useSwapProviderMetadata`, `useSwapSupportedNetworks`, `useStakingSupportedNetworks`.
    - `SwapContext` and `StakingContext` gain `isNetworkSupportLoading: boolean` for surfacing the loading state of the network-support check. While loading, `isNetworkSupported` is pessimistically `false` (so quote queries don't fire on a maybe-unsupported network), and validation suppresses the "unsupported network" error until support resolution finishes.
    - `SwapContext` and `StakingContext` expose `swapProvidersMetadata` / `stakingProvidersMetadata` (`Record<providerId, metadata | undefined>`) and `isSwapProvidersMetadataLoading` / `isStakingProvidersMetadataLoading`. `swapProviders` / `stakingProviders` stay as the raw provider list. Each provider in the settings modal renders independently and falls back to its `providerId` until its metadata resolves — one slow/broken provider does not block the others.
    - `OptionSwitcher` gains a `loading` prop that replaces the chevron with a `Skeleton`. Not currently consumed by the bundled widgets (per-row fallback rendering supersedes it) but available for custom UIs.
