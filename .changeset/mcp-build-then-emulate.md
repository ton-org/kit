---
"@ton/mcp": minor
---

Replace the one-shot `send_ton` / `send_jetton` / `send_nft` tools with prepare-only `build_ton_transfer`, `build_jetton_transfer`, and `build_nft_transfer`. The build tools build a transaction and return a ready-to-send `transaction` (`messages`, `validUntil`, `fromAddress`) without broadcasting, mirroring the `get_swap_quote` pipeline. Preview the result with `emulate_transaction`, then broadcast with `send_raw_transaction`, passing `transaction.fromAddress` along with the messages.

Because they do not sign, the build tools are available to read-only and operator-keyless agentic wallets. Transfers now go through the single `build_*` → `emulate_transaction` → `send_raw_transaction` path — there are no one-shot send tools.
