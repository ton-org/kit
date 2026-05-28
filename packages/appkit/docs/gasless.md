# Gasless

AppKit supports gasless transactions: a relayer co-signs and broadcasts the transaction, charging the user a fee in a relayer-accepted asset (e.g. USDT) instead of TON. Useful when the user holds jettons but no TON.

Available providers:

- **createTonApiGaslessProvider** – relay via the TonAPI gasless REST API (no extra dependencies)

## Wallet requirements

The connected wallet must advertise the `SignMessage` TonConnect feature. Gasless sends the *internal* message BoC to the relayer instead of an external message, so the wallet needs a different signing capability than `sendTransaction`. Check via `wallet.getSupportedFeatures()` — `sendGaslessTransaction` throws `GaslessError(SIGN_MESSAGE_NOT_SUPPORTED)` if the feature is missing.

## Setup

Pass `createTonApiGaslessProvider()` to the `AppKit` constructor. With no arguments, the factory auto-registers every network the kit was configured with:

```ts
// Initialize AppKit with the TonAPI gasless provider.
// With no arguments, the factory auto-registers every network the kit was configured with.
const appKit = new AppKit({
    networks: {
        [Network.mainnet().chainId]: {
            apiClient: { url: 'https://toncenter.com', key: 'your-key' },
        },
    },
    providers: [createTonApiGaslessProvider()],
});
```

To pass per-chain `apiKey` / `endpoint` overrides:

```ts
// Per-chain overrides — pass an `apiKey` and/or `endpoint` per network.
const appKit = new AppKit({
    networks: {
        [Network.mainnet().chainId]: {
            apiClient: { url: 'https://toncenter.com', key: 'your-key' },
        },
    },
    providers: [
        createTonApiGaslessProvider({
            chains: {
                [Network.mainnet().chainId]: { apiKey: process.env.TON_API_KEY },
            },
        }),
    ],
});
```

## Regular vs. gasless USDT transfer

Both flows produce the same on-chain outcome — a USDT jetton transfer from the user. The difference is *who pays the TON gas* and *what the wallet signs*.

### Regular jetton transfer (user pays TON gas)

```ts
const { messages } = await createTransferJettonTransaction(appKit, {
    jettonAddress: USDT_MASTER,
    recipientAddress: recipient,
    amount,
    jettonDecimals: USDT_DECIMALS,
});

await sendTransaction(appKit, { messages });
```

Cost: the user spends **~0.05 TON** on gas (whatever is unused is refunded). Wallet needs the `SendTransaction` feature (almost all do).

### Gasless jetton transfer (user pays only the jetton fee)

```ts
// Resolve the relayer's address so unspent gas (the jetton `excess`) goes
// back to the relayer that paid it, not to the user's wallet.
const { relayAddress } = await getGaslessConfig(appKit);

// Reuse the same builder as a regular jetton transfer: it resolves the
// jetton wallet address, builds the payload and attaches the network gas
// (which the relayer ends up covering) for us.
const { messages } = await createTransferJettonTransaction(appKit, {
    jettonAddress: USDT_MASTER,
    recipientAddress: recipient,
    amount,
    jettonDecimals: USDT_DECIMALS,
    responseDestination: relayAddress,
});

// Pay the relayer's fee in USDT. Quote first so the fee and validity window
// can be reviewed before the wallet signs.
const quote = await getGaslessQuote(appKit, {
    messages,
    feeAsset: USDT_MASTER,
});
await sendGaslessTransaction(appKit, { quote });
```

Cost: the user spends **0 TON** and a small amount of USDT (the relayer fee, shown in `quote.fee`). Wallet needs the `SignMessage` feature.

## Migration recipe

The `messages` array is built the same way for both flows — the relayer wraps your messages on its end and adds the fee transfer. Two changes versus a regular send:

1. Set the jetton transfer's `responseDestination` to the relayer's `relayAddress` (from `getGaslessConfig`) so the unspent TON gas returns to the relayer that paid it instead of the user's wallet.
2. Replace `sendTransaction(appKit, { messages })` with `getGaslessQuote(appKit, { messages, feeAsset })` followed by `sendGaslessTransaction(appKit, { quote })`.

`feeAsset` is the jetton master the relayer charges the fee in. The TonAPI provider requires it; discover the relayer-accepted assets via `getGaslessConfig(appKit)` (returns `{ relayAddress, supportedAssets }`), or hardcode the jetton master you want to charge in. The `getGaslessJettonTransferQuote` convenience wrapper handles both points above for you.

For React projects, the same flow is available as hooks (`useSendTransaction` / `useGaslessQuote` + `useSendGaslessTransaction`).

## Error codes

| Code | When it happens |
|---|---|
| `UNSUPPORTED_FEE_ASSET` | The relayer does not accept the chosen `feeAsset`. |
| `FEE_ASSET_NOT_OWNED` | The user has never held the chosen `feeAsset`, so the relayer cannot resolve its (uninitialized) jetton wallet. Pick a fee asset the user already owns. |
| `UNSUPPORTED_OPERATION` | The provider does not implement the requested mode (e.g. a jetton-fee provider called without `feeAsset`). |
| `QUOTE_FAILED` | Relayer rejected the quote (insufficient liquidity, malformed messages, …). |
| `SEND_FAILED` | Relayer rejected the signed BoC, or all retries were exhausted. |
| `CONFIG_FAILED` | Failed to fetch the relayer's configuration (relay address + accepted fee assets). |
| `SIGN_MESSAGE_NOT_SUPPORTED` | Connected wallet does not advertise the `SignMessage` feature. |
| `TOO_MANY_MESSAGES` | Quote carries more messages than the wallet's `SignMessage.maxMessages` cap. |
| `QUOTE_EXPIRED` | Quote's `validUntil` window has passed; checked before signing so the wallet is not prompted for a quote the relayer would reject. Fetch a fresh quote. |
| `WALLET_MISMATCH` | Quote was issued for a different address than the selected wallet (e.g. the active wallet was switched after quoting). |

<!--
This file is auto-generated. Do not edit manually.
Changes will be overwritten when running the docs update script.
Source template: template/packages/appkit/docs/gasless.md
-->

