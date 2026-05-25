# Gasless Manager

`GaslessManager` lets a dApp submit on-chain transactions without the user holding TON for gas: a relayer co-signs and broadcasts the transaction, taking a jetton fee in return.

## Flow

1. **Configure** – fetch the relayer config (`getConfig`) to learn which jettons it accepts as fee payment and its relay address.
2. **Estimate** – call `estimate` with your messages and chosen fee jetton. The relayer returns *wrapped* messages, a fee, and a `validUntil` window.
3. **Sign** – pass the wrapped messages to `wallet.signMessage` (TonConnect `SignMessage` feature). The wallet returns a signed *internal-message* BoC.
4. **Send** – submit the signed BoC via `send`; the relayer converts it to an external message, pays the gas, and broadcasts.

## Quick Start

```typescript
import { TonWalletKit, Network } from '@ton/walletkit';
import { createTonApiGaslessProvider } from '@ton/walletkit/gasless/tonapi';

const kit = new TonWalletKit({
    networks: {
        [Network.mainnet().chainId]: { apiClient: { url: 'https://toncenter.com' } },
    },
});

kit.gasless.registerProvider(
    createTonApiGaslessProvider({
        network: Network.mainnet(),
        apiKey: process.env.TON_API_KEY,
    }),
);
```

## Wallet Requirements

The connected wallet must expose the `SignMessage` feature (advertised via TonConnect device info). Wallets that only support `SendTransaction` cannot be used for gasless flows — check `wallet.getSupportedFeatures()` before invoking `send`.

## Sending a Gasless Transaction

```typescript
import { Address } from '@ton/core';
import { Network } from '@ton/walletkit';

const config = await kit.gasless.getConfig();
const feeJetton = config.supportedGasJettons[0].jettonMaster;

const estimate = await kit.gasless.estimate({
    feeJettonMaster: feeJetton,
    walletAddress: wallet.getAddress(),
    walletPublicKey: wallet.getPublicKey(),
    messages: [
        {
            address: 'EQ...jetton_wallet_address',
            amount: '60000000', // 0.06 TON gas
            payload: jettonTransferPayloadBase64,
        },
    ],
});

const { internalBoc } = await wallet.signMessage({
    messages: estimate.messages,
    validUntil: estimate.validUntil,
});

await kit.gasless.send({
    walletPublicKey: wallet.getPublicKey(),
    internalBoc,
});
```

The `validUntil` timestamp is set by the relayer (typically ~2 minutes). In `@ton/appkit-react`, `useGaslessEstimate` already refreshes estimates automatically via a 2-minute `staleTime`; if you wire `estimate` manually, re-call it for long-running UIs before signing.

## Error Codes

`GaslessError` extends `DefiError`. The codes are exposed as both static constants on `GaslessError` and a `GaslessErrorCode` enum:

| Code | Meaning |
|---|---|
| `UNSUPPORTED_FEE_JETTON` | The relayer does not accept the chosen jetton as fee payment. |
| `ESTIMATE_FAILED` | Relayer rejected the estimate (insufficient liquidity, malformed messages, …). |
| `SEND_FAILED` | Relayer rejected the signed BoC, or all retries were exhausted. |
| `CONFIG_FAILED` | Relayer config endpoint failed. |
| `SIGN_MESSAGE_NOT_SUPPORTED` | Connected wallet does not implement the `SignMessage` feature. Surfaced by the higher-level `sendGaslessTransaction` action in `@ton/appkit`. |
| `TOO_MANY_MESSAGES` | The estimate carries more messages than the wallet's advertised `SignMessage.maxMessages` cap. Surfaced by `sendGaslessTransaction` in `@ton/appkit`. |

## Creating a Custom Gasless Provider

To target a different relayer, extend `GaslessProvider`:

```typescript
import {
    GaslessProvider,
    type GaslessConfig,
    type GaslessEstimateParams,
    type GaslessEstimateResult,
    type GaslessSendParams,
    type Network,
} from '@ton/walletkit';

export class MyGaslessProvider extends GaslessProvider {
    readonly providerId = 'my-relayer';

    getSupportedNetworks(): Network[] {
        return [Network.mainnet()];
    }

    async getConfig(): Promise<GaslessConfig> {
        // …
    }

    async estimate(params: GaslessEstimateParams): Promise<GaslessEstimateResult> {
        // …
    }

    async send(params: GaslessSendParams): Promise<void> {
        // …
    }
}
```

## Available Providers

- **TonApi** (`@ton/walletkit/gasless/tonapi`) – uses the public TonApi gasless REST API documented at `https://docs.tonapi.io/tonapi/rest-api/gasless`. One provider instance per network: pass `network: Network.mainnet()` (default endpoint `https://tonapi.io`) or `network: Network.testnet()` (`https://testnet.tonapi.io`). No external SDK dependency — talks to TonAPI directly via `fetch`.

## API Reference

### GaslessManager

#### `getConfig(providerId?)`
Fetch the relayer config (supported jettons, relay address).

#### `estimate(params, providerId?)`
Wrap caller's messages with relayer fee-collection logic. Returns wrapped messages, fee, and `validUntil`.

#### `send(params, providerId?)`
Submit a signed internal-message BoC to the relayer.

#### `registerProvider(provider)` / `setDefaultProvider(providerId)`
Standard `DefiManager` lifecycle methods.
