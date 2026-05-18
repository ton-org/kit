# @ton/mcp

## 0.1.15-alpha.16

### Patch Changes

- 0995b96: Added emulate_transaction tool — dry-run any transaction before broadcasting to verify expected TON and jetton balance changes (uses wallet.getTransactionPreview)
- 138b416: Added `--help` / `-h` flag to CLI — prints usage and exits instead of starting the stdio server
- 4bab31c: Renamed `get_jetton_info` input param from `address` to `jettonAddress` for consistency with `get_jetton_balance` and other jetton tools. Updated all skill docs to match: fixed CLI arg names, added missing optional params, clarified xStocks API should use curl (not WebFetch), and specified `"TON"` as the literal fromToken string for native TON swaps.
- 4e73308: Encrypt local TON config files on first read when an existing plaintext config is detected.
- 0995b96: Added raw and human readable outputs for amounts in mcp
- c67bb0e: Added emulation support to the TonAPI client and introduced provider-agnostic emulation domain models under `api/models/emulation` (`EmulationResult`, `EmulationResponse`, `EmulationTransaction`, `EmulationMessage`, `EmulationAction`, `EmulationTraceNode`, `EmulationAddressBookEntry`). `ApiClient.fetchEmulation` now returns `EmulationResult` instead of the toncenter-specific `ToncenterEmulationResult`, so callers get the same shape regardless of backend. Reorganized toncenter raw types under `clients/toncenter/types/*` (NFTs, jettons, DNS, metadata, raw emulation), moved the `ApiClient` interface to `api/interfaces`, removed legacy emulation parsing utilities (`utils/toncenterEmulation`, message/jetton parser handlers), and migrated optional NFT and DNS results from `null` to `undefined` across walletkit, appkit, and mcp.
- 494250e: Added option to pass settlement options to Omniston provider. Added escrow settlement for mcp
- d8e7aa5: Added option to generate TON Proof
- 33f8bd3: Updated agentic dashboard URL from `agentic-wallets-dashboard.vercel.app` to `agents.ton.org`
- Updated dependencies [b31befc]
- Updated dependencies [db5c23b]
- Updated dependencies [70efd43]
- Updated dependencies [fd7e89f]
- Updated dependencies [74e0b78]
- Updated dependencies [0042cc9]
- Updated dependencies [db5c23b]
- Updated dependencies [1f552f7]
- Updated dependencies [5b75f27]
- Updated dependencies [50c5bf3]
- Updated dependencies [c1f5243]
- Updated dependencies [c1f5243]
- Updated dependencies [c67bb0e]
- Updated dependencies [494250e]
- Updated dependencies [4a060fb]
    - @ton/walletkit@1.0.0

## 0.1.15-alpha.15

### Patch Changes

- Updated dependencies [0042cc9]
    - @ton/walletkit@0.0.12-alpha.3

## 0.1.15-alpha.14

### Patch Changes

- 4e73308: Encrypt local TON config files on first read when an existing plaintext config is detected.
- d8e7aa5: Added option to generate TON Proof
- Updated dependencies [74e0b78]
- Updated dependencies [1f552f7]
- Updated dependencies [4a060fb]
    - @ton/walletkit@0.0.12-alpha.2

## 0.1.15-alpha.13

### Patch Changes

- Updated dependencies
    - @ton/walletkit@0.0.12-alpha.1

## 0.1.15-alpha.12

### Patch Changes

- Updated agentic dashboard URL from `agentic-wallets-dashboard.vercel.app` to `agents.ton.org`

## 0.1.15-alpha.11

### Patch Changes

- 138b416: Added `--help` / `-h` flag to CLI — prints usage and exits instead of starting the stdio server
- 4bab31c: Renamed `get_jetton_info` input param from `address` to `jettonAddress` for consistency with `get_jetton_balance` and other jetton tools. Updated all skill docs to match: fixed CLI arg names, added missing optional params, clarified xStocks API should use curl (not WebFetch), and specified `"TON"` as the literal fromToken string for native TON swaps.

## 0.1.15-alpha.10

### Patch Changes

- 0995b96: Added emulate_transaction tool — dry-run any transaction before broadcasting to verify expected TON and jetton balance changes (uses wallet.getTransactionPreview)
- 0995b96: Added raw and human readable outputs for amounts in mcp

## 0.1.15-alpha.9

### Patch Changes

- 494250e: Added option to pass settlement options to Omniston provider. Added escrow settlement for mcp
- Updated dependencies [494250e]
    - @ton/walletkit@0.0.12-alpha.0

## 0.1.15-alpha.8

### Patch Changes

- 2760b89: Added agentic wallet management APIs
- 2370f94: Updated skills to improve user flow with prompts and urls
- 79e00db: Added logs level from env for walletkit, supressed node deprecation warnings for mcp
- 13af8e2: Add proxy support for envs that needs them(claude ai)
- Updated dependencies [babd2af]
- Updated dependencies [29d0d22]
- Updated dependencies [79e00db]
- Updated dependencies [7491d5e]
- Updated dependencies [fa55b70]
- Updated dependencies [72930db]
    - @ton/walletkit@0.0.11

## 0.1.15-alpha.7

### Patch Changes

- 13af8e2: Add proxy support for envs that needs them(claude ai)
- Updated dependencies [72930db]
    - @ton/walletkit@0.0.11-alpha.2

## 0.1.15-alpha.6

### Patch Changes

- Added logs level from env for walletkit, supressed node deprecation warnings for mcp
- Updated dependencies
    - @ton/walletkit@0.0.11-alpha.1

## 0.1.15-alpha.5

### Patch Changes

- Updated skills to improve user flow with prompts and urls

## 0.1.15-alpha.4

### Patch Changes

- Updated dependencies
    - @ton/walletkit@0.0.11-alpha.0

## 0.1.15-alpha.0

### Patch Changes

- 2760b89: Added agentic wallet management APIs

## 0.1.14

### Patch Changes

- Updated dependencies [9c1a73d]
    - @ton/walletkit@0.0.10

## 0.1.13

### Patch Changes

- ac2a290: Add possibility to get transaction status by boc or hash. Added 0x prefix for hash from ApiClient.sendBoc
- Updated dependencies [97e06e7]
- Updated dependencies [ac2a290]
    - @ton/walletkit@0.0.9
