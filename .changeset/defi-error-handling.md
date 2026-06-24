---
'@ton/walletkit': patch
'@ton/appkit': patch
'@ton/appkit-react': patch
---

DeFi operations (swap, staking, crypto-onramp, gasless) now always throw a typed `DefiError` on failure — a specific subclass (`SwapError`, `StakingError`, `CryptoOnrampError`, `GaslessError`) when available, otherwise a `DefiError` with the new `DefiErrorCode.Unknown` code (the original error is preserved in `details`). Failures can be reliably caught and branched on by `code`.
