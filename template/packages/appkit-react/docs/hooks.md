---
target: packages/appkit-react/docs/hooks.md
---

# Hooks

AppKit React provides a set of hooks to interact with the blockchain and wallets.

## Core
 
 ### `useAppKit`
 
 Hook to access the `AppKit` instance.
 
 %%demo/examples/src/appkit/hooks/core#USE_APP_KIT%%
 
 ### `useAppKitTheme`
 
 Hook to access and toggle the current theme.
 
 %%demo/examples/src/appkit/hooks/core#USE_APP_KIT_THEME%%
 
 ## Balances

### `useBalance`

Hook to get the TON balance of the currently selected wallet.

%%demo/examples/src/appkit/hooks/balances#USE_BALANCE%%

### `useBalanceByAddress`

Hook to fetch the TON balance of a specific address.

%%demo/examples/src/appkit/hooks/balances#USE_BALANCE_BY_ADDRESS%%

### `useWatchBalance`

Hook to enable real-time balance updates for the currently selected wallet. It automatically updates the TanStack Query cache.

%%demo/examples/src/appkit/hooks/balances#USE_WATCH_BALANCE%%

### `useWatchBalanceByAddress`

Hook to enable real-time balance updates for a specific address.

%%demo/examples/src/appkit/hooks/balances#USE_WATCH_BALANCE_BY_ADDRESS%%

## Jettons

### `useJettons`

Hook to get all jettons owned by the currently selected wallet.

%%demo/examples/src/appkit/hooks/jettons#USE_JETTONS%%

### `useJettonsByAddress`

Hook to get all jettons owned by a specific address.

%%demo/examples/src/appkit/hooks/jettons#USE_JETTONS_BY_ADDRESS%%

### `useJettonBalanceByAddress`

Hook to get the balance of a specific jetton for a wallet address.

%%demo/examples/src/appkit/hooks/jettons#USE_JETTON_BALANCE_BY_ADDRESS%%

### `useJettonInfo`

Hook to get information about a specific jetton by its address.

%%demo/examples/src/appkit/hooks/jettons#USE_JETTON_INFO%%

### `useJettonWalletAddress`

Hook to get the jetton wallet address for a specific jetton and owner address.

%%demo/examples/src/appkit/hooks/jettons#USE_JETTON_WALLET_ADDRESS%%

### `useTransferJetton`

Hook to transfer jettons to a recipient address.

%%demo/examples/src/appkit/hooks/jettons#USE_TRANSFER_JETTON%%

### `useWatchJettons`

Hook to enable real-time jetton updates for the currently selected wallet.

%%demo/examples/src/appkit/hooks/jettons#USE_WATCH_JETTONS%%

### `useWatchJettonsByAddress`

Hook to enable real-time jetton updates for a specific address.

%%demo/examples/src/appkit/hooks/jettons#USE_WATCH_JETTONS_BY_ADDRESS%%

## Network

### `useNetwork`

Hook to get network of the selected wallet.

%%demo/examples/src/appkit/hooks/network#USE_NETWORK%%

### `useNetworks`

Hook to get all configured networks.

%%demo/examples/src/appkit/hooks/network#USE_NETWORKS%%

### `useBlockNumber`

Hook to get the current masterchain block number.

%%demo/examples/src/appkit/hooks/network#USE_BLOCK_NUMBER%%

### `useDefaultNetwork`

Hook to get and set the default network for wallet connections. Returns a tuple `[defaultNetwork, setDefaultNetwork]`.

%%demo/examples/src/appkit/hooks/network#USE_DEFAULT_NETWORK%%

## NFT

### `useNft`

Hook to get a single NFT.

%%demo/examples/src/appkit/hooks/nft#USE_NFT%%

### `useNfts`

Hook to get NFTs of the selected wallet.

%%demo/examples/src/appkit/hooks/nft#USE_NFTS%%

### `useNftsByAddress`

Hook to get NFTs of a specific address.

%%demo/examples/src/appkit/hooks/nft#USE_NFTS_BY_ADDRESS%%

### `useTransferNft`

Hook to transfer NFT to another wallet.

%%demo/examples/src/appkit/hooks/nft#USE_TRANSFER_NFT%%

## Signing

### `useSignBinary`

Hook to sign binary data with the connected wallet.

%%demo/examples/src/appkit/hooks/signing#USE_SIGN_BINARY%%

### `useSignCell`

Hook to sign TON Cell data with the connected wallet.

%%demo/examples/src/appkit/hooks/signing#USE_SIGN_CELL%%

### `useSignText`

Hook to sign text messages with the connected wallet.

%%demo/examples/src/appkit/hooks/signing#USE_SIGN_TEXT%%

## Swap

### `useSwapQuote`

Hook to get a swap quote for a token pair.

%%demo/examples/src/appkit/hooks/swap#USE_SWAP_QUOTE%%

### `useBuildSwapTransaction`

Hook to build a transaction for a swap operation based on a quote.

%%demo/examples/src/appkit/hooks/swap#USE_BUILD_SWAP_TRANSACTION%%

### `useSwapProvider`

Hook to read and change the currently selected swap provider. Returns a tuple `[provider, setProviderId]` — mirrors `useSelectedWallet`.

%%demo/examples/src/appkit/hooks/swap#USE_SWAP_PROVIDER%%

### `useSwapProviders`

Hook to get all registered swap providers. The returned array keeps a stable reference until the provider list changes, so it is safe to use with `useSyncExternalStore`.

%%demo/examples/src/appkit/hooks/swap#USE_SWAP_PROVIDERS%%

## Staking

### `useStakingProviders`

Hook to get all registered staking providers. The returned array keeps a stable reference until the provider list changes.

%%demo/examples/src/appkit/hooks/staking#USE_STAKING_PROVIDERS%%

### `useStakingProvider`

Hook to get a specific staking provider by id (or the default when no id is passed).

%%demo/examples/src/appkit/hooks/staking#USE_STAKING_PROVIDER%%

### `useStakingQuote`

Hook to get a quote for staking or unstaking a given amount.

%%demo/examples/src/appkit/hooks/staking#USE_STAKING_QUOTE%%

### `useStakedBalance`

Hook to get the user's currently staked balance.

%%demo/examples/src/appkit/hooks/staking#USE_STAKED_BALANCE%%

### `useStakingProviderInfo`

Hook to get live info about a staking provider (APY, limits, etc.).

%%demo/examples/src/appkit/hooks/staking#USE_STAKING_PROVIDER_INFO%%

### `useStakingProviderMetadata`

Hook to get static metadata about a staking provider (name, receive token, etc.).

%%demo/examples/src/appkit/hooks/staking#USE_STAKING_PROVIDER_METADATA%%

### `useBuildStakeTransaction`

Hook to build a stake transaction from a previously fetched quote.

%%demo/examples/src/appkit/hooks/staking#USE_BUILD_STAKE_TRANSACTION%%

## Gasless

Gasless lets a dApp submit on-chain transactions without the user holding TON for gas: a relayer co-signs and broadcasts the transaction, charging the user a fee in a relayer-accepted asset (e.g. USDT). The connected wallet must support the `SignMessage` TonConnect feature. See the [gasless guide](https://github.com/ton-connect/kit/blob/main/packages/appkit/docs/gasless.md) for a regular-send → gasless-send migration.

### `useGaslessProviders`

Hook to get all registered gasless providers.

%%demo/examples/src/appkit/hooks/gasless#USE_GASLESS_PROVIDERS%%

### `useGaslessProvider`

Hook to get the current default gasless provider and a setter to switch the default.

%%demo/examples/src/appkit/hooks/gasless#USE_GASLESS_PROVIDER%%

### `useGaslessProviderMetadata`

Hook to fetch static metadata (display name, logo, url) for a gasless provider.

%%demo/examples/src/appkit/hooks/gasless#USE_GASLESS_PROVIDER_METADATA%%

### `useGaslessConfig`

Hook to fetch the gasless relayer's configuration — relay address (e.g. for jetton-transfer `responseDestination`) and accepted fee assets.

%%demo/examples/src/appkit/hooks/gasless#USE_GASLESS_CONFIG%%

### `useGaslessQuote`

Hook to fetch a gasless quote. Auto-refetches as inputs change; cached results become stale after ~2 minutes (matches the relayer `validUntil` window). Omit `feeAsset` for free / sponsored providers — jetton-fee providers throw `GaslessError(UNSUPPORTED_OPERATION)` in that case.

%%demo/examples/src/appkit/hooks/gasless#USE_GASLESS_QUOTE%%

### `useGaslessJettonTransferQuote`

Hook to fetch a gasless quote for a jetton transfer from semantic params (`jettonAddress`, `recipientAddress`, `amount`, `feeAsset`) — no manual message building. Auto-refetches as inputs change and on wallet/network switch.

%%demo/examples/src/appkit/hooks/gasless#USE_GASLESS_JETTON_TRANSFER_QUOTE%%

### `useSendGaslessTransaction`

Hook to sign a previously computed quote and submit the resulting BoC to the relayer. Returns a `GaslessSendResponse` (`{ boc, normalizedBoc, normalizedHash, internalBoc }`).

Throws:
- `GaslessError(QUOTE_EXPIRED)` if the quote's `validUntil` window has passed (checked before signing).
- `GaslessError(WALLET_MISMATCH)` if the quote was issued for a different address than the selected wallet.
- `GaslessError(SIGN_MESSAGE_NOT_SUPPORTED)` if the wallet does not advertise `SignMessage`.
- `GaslessError(TOO_MANY_MESSAGES)` if the quote carries more messages than the wallet's `maxMessages` cap.

%%demo/examples/src/appkit/hooks/gasless#USE_SEND_GASLESS_TRANSACTION%%

## Transaction

### `useSendTransaction`

Hook to send a transaction to the blockchain.

%%demo/examples/src/appkit/hooks/transaction#USE_SEND_TRANSACTION%%

### `useSignMessage`

Hook to sign a transaction-shaped request without broadcasting it. Returns a signed internal-message BoC that can be relayed on-chain by a third party (e.g. a gasless relayer). Requires wallet support for the `SignMessage` feature.

%%demo/examples/src/appkit/hooks/transaction#USE_SIGN_MESSAGE%%

### `useTransferTon`

Hook to simplify transferring TON to another address.

%%demo/examples/src/appkit/hooks/transaction#USE_TRANSFER_TON%%

### `useWatchTransactions`

Hook to watch for new transactions for the currently selected wallet in real-time.

%%demo/examples/src/appkit/hooks/transaction#USE_WATCH_TRANSACTIONS%%

### `useWatchTransactionsByAddress`

Hook to watch for new transactions for a specific address in real-time.

%%demo/examples/src/appkit/hooks/transaction#USE_WATCH_TRANSACTIONS_BY_ADDRESS%%

## Wallets

### `useAddress`

Hook to get current wallet address.

%%demo/examples/src/appkit/hooks/wallets#USE_ADDRESS%%

### `useConnect`

Hook to connect a wallet.

%%demo/examples/src/appkit/hooks/wallets#USE_CONNECT%%

### `useConnectedWallets`

Hook to get all connected wallets.

%%demo/examples/src/appkit/hooks/wallets#USE_CONNECTED_WALLETS%%

### `useConnectorById`

Hook to get a connector by its ID.

%%demo/examples/src/appkit/hooks/wallets#USE_CONNECTOR_BY_ID%%

### `useConnectors`

Hook to get all available connectors.

%%demo/examples/src/appkit/hooks/wallets#USE_CONNECTORS%%

### `useDisconnect`

Hook to disconnect a wallet.

%%demo/examples/src/appkit/hooks/wallets#USE_DISCONNECT%%

### `useSelectedWallet`

Hook to get and set the currently selected wallet.

%%demo/examples/src/appkit/hooks/wallets#USE_SELECTED_WALLET%%


