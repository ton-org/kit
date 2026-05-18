---
target: README.md
---

# TON Connect Kit

`ton-connect/kit` is a TON developer toolkit monorepo for building dApps, wallets, and agent integrations around TON.

[![Release](https://github.com/ton-connect/kit/actions/workflows/release.yml/badge.svg?branch=release)](https://github.com/ton-connect/kit/actions/workflows/release.yml)
[![Tests](https://github.com/ton-connect/kit/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/ton-connect/kit/actions/workflows/test.yml)

## Packages

- **AppKit** (`@ton/appkit`, `@ton/appkit-react`) - dApp-side SDK for wallet connection, asset actions, swaps, staking, and React UI/hooks. Start with the [AppKit README](https://github.com/ton-connect/kit/blob/main/packages/appkit/README.md) and [AppKit React README](https://github.com/ton-connect/kit/blob/main/packages/appkit-react/README.md).
- **WalletKit** (`@ton/walletkit`) - wallet-side SDK for handling TON Connect requests, previews, wallet state, bridge flows, and wallet app integrations. Start with the [WalletKit README](https://github.com/ton-connect/kit/blob/main/packages/walletkit/README.md).
- **@ton/mcp** - MCP server and CLI for TON wallet operations, transfers, swaps, NFTs, DNS, TonProof, and agentic wallet workflows. Start with the [@ton/mcp README](https://github.com/ton-connect/kit/blob/main/packages/mcp/README.md).

## Demos

- [AppKit Minter](https://appkit-minter.vercel.app/) - dApp demo for AppKit actions, NFT minting, assets, swap, and staking. Source: [apps/appkit-minter](https://github.com/ton-connect/kit/tree/main/apps/appkit-minter).
- [WalletKit Demo Wallet](https://walletkit-demo-wallet.vercel.app/) - reference wallet implementation. Source: [apps/demo-wallet](https://github.com/ton-connect/kit/tree/main/apps/demo-wallet).

## Development

```bash
pnpm install
pnpm docs:update
pnpm build
pnpm typecheck
pnpm lint
pnpm quality
```

For package-specific work, use `pnpm --filter <package> <script>`, for example:

```bash
pnpm --filter @ton/appkit test
pnpm --filter @ton/walletkit typecheck
pnpm --filter @ton/mcp build
```

## Resources

- [TON Connect Protocol](https://github.com/ton-blockchain/ton-connect) - protocol specification and reference materials.
- [DeepWiki: ton-connect/kit](https://deepwiki.com/ton-connect/kit) - generated repository knowledge base.
- [AppKit Minter](https://appkit-minter.vercel.app/) and [WalletKit Demo Wallet](https://walletkit-demo-wallet.vercel.app/) - deployed demos.

## License

This repository is licensed under the [MIT License](https://github.com/ton-connect/kit/blob/main/LICENSE).
