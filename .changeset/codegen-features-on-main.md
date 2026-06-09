---
'@ton/walletkit': patch
'@ton/appkit': patch
'@ton/appkit-react': patch
---

- `@ton/appkit`: reworked connector events — replaced `CONNECTED`/`DISCONNECTED` with a single `WALLETS_UPDATED` event; TonConnect connector now cleans up the default-network subscription on `destroy` and guards `getTonConnectUI` after destroy
- `@ton/appkit-react`: removed `BalanceBadge` component and its re-export from `features/balances`
- `@ton/appkit-react`: fixed decimals handling in `SendJettonButton`
- `@ton/walletkit`, `@ton/appkit`, `@ton/appkit-react`: unified provider error API — added `DefiErrorCode` and `SwapErrorCode` enums and re-exported them from the package roots; `map-swap-error` and `map-defi-error` updated to use the codes
