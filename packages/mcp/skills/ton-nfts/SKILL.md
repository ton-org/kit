---
name: ton-nfts
description: View and transfer NFTs on the TON blockchain. Use when the user wants to see their NFTs, list collectibles, check NFT details, send an NFT, or transfer an NFT to someone.
user-invocable: true
disable-model-invocation: false
---

# TON NFT Operations

View and transfer NFTs on the TON blockchain.

## MCP Tools

| Tool | Required | Optional |
| ---- | -------- | -------- |
| `get_nfts` | — | `limit`, `offset`, `walletSelector` |
| `get_nfts_by_address` | `address` | `limit`, `offset` |
| `get_nft` | `nftAddress` | — |
| `send_nft` | `nftAddress`, `toAddress` | `comment`, `walletSelector` |
| `emulate_transaction` | `messages` | `validUntil` |
| `send_raw_transaction` | `messages` | `validUntil`, `fromAddress`, `walletSelector` |

`send_nft` does NOT broadcast — it returns ready-to-send `transaction.messages`. Preview with `emulate_transaction`, then broadcast with `send_raw_transaction`.

## Workflows

### List My NFTs
1. Call `get_nfts` to list NFTs in the active wallet
2. Use `limit` and `offset` for pagination

### View NFT Details
1. Call `get_nft` with the `nftAddress`

### Send an NFT
1. Call `get_nfts` to find the NFT address if the user doesn't have it
2. Call `send_nft` with `nftAddress` and `toAddress` to build the transaction (it is NOT sent)
3. Optionally preview it with `emulate_transaction` using the returned `transaction.messages`
4. Ask one short yes/no confirmation before transferring the NFT
5. Broadcast with `send_raw_transaction` passing the `transaction.messages`
6. Poll `get_transaction_status` with the returned `normalizedHash` until status is `completed` or `failed` (see `ton-balance` skill)

## Notes

- `send_nft` builds the transaction only; `send_raw_transaction` is the tool that signs and broadcasts it
- Use `emulate_transaction` to preview expected balance changes before broadcasting (fake signature)
- Always confirm with the user before transferring an NFT; prefer the host client's structured confirmation UI when available, otherwise accept natural-language yes/no and do not require a fixed confirmation phrase
- If no wallet is configured, use the `ton-create-wallet` skill first
