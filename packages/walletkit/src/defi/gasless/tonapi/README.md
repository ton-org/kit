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
    fetchApi: customFetch, // optional fetch impl (testing / SSR)
    providerId: 'tonapi', // optional id; defaults to 'tonapi'
    sendRetries: 3, // optional override; defaults to 3
    sendRetryDelayMs: 2000, // optional override; defaults to 2000
};
```

`chains` is optional — when omitted, every network the kit was configured with auto-registers with default endpoints. Pass a partial map to override only specific chains.

If no chain ends up configured, the factory throws.

## Retry policy

`sendTransaction` retries on transient failures only (HTTP 5xx, 408, 429, network errors) with exponential backoff (`sendRetryDelayMs * 2 ** attempt`, starting at 2000ms). 4xx responses fail fast. The wallet's seqno guard protects against on-chain double-spend if a retry duplicates an accepted BoC.

`getQuote` and `getConfig` do not retry — quotes are short-lived (~2 min `validUntil`), and the config is cached at the React Query layer.

## BoC encoding

TonAPI accepts and returns BoCs as hex strings; our domain types are base64 (`Base64String`). Mappers (`mappers/map-gasless-quote.ts`, `mappers/map-gasless-send.ts`) handle the conversion — callers always see base64.

The `send` response carries the broadcasted external message as hex; we run it through `getNormalizedExtMessageHash` (TEP-467) to derive `normalizedHash` for explorer / status lookup.

## Error mapping

TonAPI returns a numeric `error_code` in the error body. The provider maps the
known ones to domain `GaslessErrorCode` values (see `mappers/map-gasless-error.ts`);
any other code falls back to the call-site's code (`QUOTE_FAILED` / `SEND_FAILED` /
`CONFIG_FAILED`).

| TonAPI `error_code` | Domain `GaslessErrorCode` | Meaning |
|---|---|---|
| `40000` | `UNSUPPORTED_FEE_ASSET` | The chosen jetton is not accepted as a fee asset. |
| `40007` | `FEE_ASSET_NOT_OWNED` | The sender's jetton wallet for the fee asset is uninitialized — they have never held it. |

## Resources

- [TonAPI gasless REST API docs](https://docs.tonapi.io/tonapi/rest-api/gasless)
- [TEP-467: Normalized external message hash](https://github.com/ton-blockchain/TEPs/blob/master/text/0467-normalized-message-hash.md)
