# TonAPI gasless provider

Gasless relay via the public [TonAPI gasless REST API](https://docs.tonapi.io/tonapi/rest-api/gasless): relayer pays gas, user pays a fee in a relayer-accepted jetton.

Public entry: **`createTonApiGaslessProvider`** from `@ton/walletkit/gasless/tonapi`. It returns a factory `(ctx) => TonApiGaslessProvider` for `kit.gasless.registerProvider(createTonApiGaslessProvider(config))`. For advanced use, `TonApiGaslessProvider.createFromContext(ctx, config)` builds the provider from a `ProviderFactoryContext`.

## Configuration

Per-chain overrides are keyed by `chainId` (same keys as `TonWalletKit` `networks`):

```typescript
import { Network } from '@ton/walletkit';
import type { TonApiGaslessProviderConfig } from '@ton/walletkit/gasless/tonapi';

const config: TonApiGaslessProviderConfig = {
    chains: {
        [Network.mainnet().chainId]: {
            apiKey: process.env.TON_API_KEY_MAINNET, // optional Bearer token
            endpoint: 'https://tonapi.io', // optional override; defaults to the network's public TonAPI endpoint
        },
        [Network.testnet().chainId]: { apiKey: process.env.TON_API_KEY_TESTNET },
    },
    providerId: 'tonapi', // optional id; defaults to 'tonapi'
    sendRetries: 5, // optional override; defaults to 5
    sendRetryDelayMs: 1000, // optional override; defaults to 1000
    quoteRetries: 5, // optional override; defaults to 5
    quoteRetryDelayMs: 1000, // optional override; defaults to 1000
    configCacheTtlMs: 300000, // optional; in-memory /v2/gasless/config cache TTL, defaults to 5 min (0 disables)
};
```

`chains` is optional — when omitted, every network the kit was configured with auto-registers with default endpoints. Pass a partial map to override only specific chains.

If no chain ends up configured, the factory throws.

## Retry policy

`sendTransaction` and `getQuote` retry on transient failures only (HTTP 5xx, 408, 429, network errors) with a fixed delay (`sendRetryDelayMs` / `quoteRetryDelayMs`). 4xx responses fail fast. The wallet's seqno guard protects against on-chain double-spend if a retry duplicates an accepted BoC.

`getConfig` does not retry — its result is cached in-memory (`configCacheTtlMs`).

## BoC encoding

TonAPI accepts and returns BoCs as hex strings; our domain types are base64 (`Base64String`). Mappers (`mappers/map-gasless-quote.ts`, `mappers/map-gasless-send.ts`) handle the conversion — callers always see base64.

The `send` response carries the broadcasted external message as hex; we run it through `getNormalizedExtMessageHash` (TEP-467) to derive `normalizedHash` for explorer / status lookup.

## Error mapping

TonAPI returns a numeric `error_code` in the error body. Code-specific mapping to
domain `GaslessErrorCode` values is currently disabled (see the note in
`mappers/map-gasless-error.ts`) — every error falls back to the call-site's code
(`QUOTE_FAILED` / `SEND_FAILED` / `CONFIG_FAILED`) carrying the relayer's own message.

## Resources

- [TonAPI gasless REST API docs](https://docs.tonapi.io/tonapi/rest-api/gasless)
- [TEP-467: Normalized external message hash](https://github.com/ton-blockchain/TEPs/blob/master/text/0467-normalized-message-hash.md)
