---
'@ton/appkit-react': patch
'@ton/appkit': patch
'@ton/walletkit': patch
---

- Added confirmation modals for the swap and staking widgets.
- Improved error handling across swap and staking flows, especially when the network is unavailable — failures now surface in the submit button instead of hanging.
- Moved `cancelPromise` from `@ton/appkit` to `@ton/walletkit` and renamed it to `withTimeout` to reflect what it actually does (it does not abort the underlying operation). `@ton/appkit` re-exports it.
