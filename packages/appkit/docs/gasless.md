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
const wallet = getSelectedWallet(appKit);
if (!wallet) throw new Error('No wallet connected');
const ownerAddress = wallet.getAddress();

const usdtWallet = await getJettonWalletAddress(appKit, {
    jettonAddress: USDT_MASTER,
    ownerAddress,
});

const payload = createJettonTransferPayload({
    amount: parseUnits(amount, USDT_DECIMALS),
    destination: recipient,
    responseDestination: ownerAddress,
});

const messages = [
    {
        address: usdtWallet,
        amount: parseUnits('0.06', 9).toString(), // 0.06 TON for gas
        payload: asBase64(payload.toBoc().toString('base64')),
    },
];

await sendTransaction(appKit, { messages });
```

Cost: the user spends **~0.06 TON** on gas (whatever is unused is refunded). Wallet needs the `SendTransaction` feature (almost all do).

### Gasless jetton transfer (user pays only the jetton fee)

```ts
const wallet = getSelectedWallet(appKit);
if (!wallet) throw new Error('No wallet connected');
const ownerAddress = wallet.getAddress();

const usdtWallet = await getJettonWalletAddress(appKit, {
    jettonAddress: USDT_MASTER,
    ownerAddress,
});

const payload = createJettonTransferPayload({
    amount: parseUnits(amount, USDT_DECIMALS),
    destination: recipient,
    responseDestination: ownerAddress,
});

const messages = [
    {
        address: usdtWallet,
        amount: parseUnits('0.06', 9).toString(), // 0.06 TON for gas
        payload: asBase64(payload.toBoc().toString('base64')),
    },
];

const quote = await getGaslessQuote(appKit, { messages });
await sendGaslessTransaction(appKit, { quote });
```

Cost: the user spends **0 TON** and a small amount of USDT (the relayer fee, shown in `quote.fee`). Wallet needs the `SignMessage` feature.

## Migration recipe

The jetton-transfer payload and the `messages` array are unchanged — the relayer wraps your messages on its end and adds the fee transfer. The only difference between the two snippets above: replace `sendTransaction(appKit, { messages })` with `getGaslessQuote(appKit, { messages })` followed by `sendGaslessTransaction(appKit, { quote })`.

To pick a specific fee asset, pass `feeAsset` to `getGaslessQuote`. Discover the relayer-accepted assets with `getGaslessSupportedAssets(appKit)` — or hardcode the jetton master you want to charge in.

For React projects, the same flow is available as hooks (`useSendTransaction` / `useGaslessQuote` + `useSendGaslessTransaction`).

## Error codes

| Code | When it happens |
|---|---|
| `UNSUPPORTED_FEE_ASSET` | Relayer does not accept the chosen `feeAsset`. Surfaced from TonAPI's `error_code: 40000`. |
| `UNSUPPORTED_OPERATION` | Provider does not implement the requested mode (e.g. TonAPI requires `feeAsset`). |
| `QUOTE_FAILED` | Relayer rejected the quote (insufficient liquidity, malformed messages, …). |
| `SEND_FAILED` | Relayer rejected the signed BoC, or all retries were exhausted. |
| `SUPPORTED_ASSETS_FAILED` | Failed to discover relayer-accepted fee assets. |
| `SIGN_MESSAGE_NOT_SUPPORTED` | Connected wallet does not advertise the `SignMessage` feature. |
| `TOO_MANY_MESSAGES` | Quote carries more messages than the wallet's `SignMessage.maxMessages` cap. |

<!--
This file is auto-generated. Do not edit manually.
Changes will be overwritten when running the docs update script.
Source template: template/packages/appkit/docs/gasless.md
-->

