---
"@ton/appkit": minor
"@ton/appkit-react": minor
---

Expose advanced transfer parameters on the jetton, NFT and TON transfer actions (and their hooks `useTransferJetton` / `useTransferNft`).

- **Jetton transfer** (`transferJetton` / `createTransferJettonTransaction`): added `queryId`, `forwardAmount`, `forwardPayload`, `customPayload` and `gasAmount`. A raw `forwardPayload` takes priority over `comment`.
- **NFT transfer** (`transferNft` / `createTransferNftTransaction`): added `queryId`, `forwardAmount`, `forwardPayload`, `customPayload` and `responseDestination`, with the same `forwardPayload` / `comment` precedence.
- **TON transfer** (`createTransferTonTransaction`): added `extraCurrency`.

All new fields are optional — omitting them preserves the previous behaviour. Payload fields (`forwardPayload`, `customPayload`) are Base64-encoded cells; `queryId`, `forwardAmount` and `gasAmount` are nanoton / uint strings. `mode` is intentionally not exposed (it is not carried over TonConnect).

**BREAKING:** the NFT transfer `amount` field is renamed to `gasAmount` — the TON (in nanotons) attached for gas — to remove the ambiguity with a token quantity and to match the jetton transfer. Replace `{ amount }` with `{ gasAmount }` in `createTransferNftTransaction` / `transferNft` / `useTransferNft` calls.
