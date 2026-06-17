---
target: README.md
---

# AppKit, WalletKit and AgentKit monorepo

This is a TON developer toolkit monorepo for building dApps, wallets, and agent integrations around TON.

[![Release](https://github.com/ton-connect/kit/actions/workflows/release.yml/badge.svg?branch=release)](https://github.com/ton-connect/kit/actions/workflows/release.yml)
[![Tests](https://github.com/ton-connect/kit/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/ton-connect/kit/actions/workflows/test.yml)

## Packages

- **AppKit** (`@ton/appkit`, `@ton/appkit-react`) - the user-facing layer for integrating TON into Mini Apps and dApps. It provides primitives, typed React hooks, and drop-in components for wallet connection, Toncoin, Jettons, NFTs, TON DNS, swaps, and liquid staking, with TON Connect v3, embedded wallets, gasless flows, and widgets on the roadmap. Start with the [AppKit README](https://github.com/ton-connect/kit/blob/main/packages/appkit/README.md) and [AppKit React README](https://github.com/ton-connect/kit/blob/main/packages/appkit-react/README.md).
- **WalletKit** (`@ton/walletkit`) - the wallet-side layer for custodial and non-custodial wallets. It handles TON Connect requests, sign-data, transactions, exact money-flow previews, asset reads/transfers, multi-wallet state, pluggable signers, web/mobile/extension integrations, and custodial backend use cases while keeping key-management control with the wallet. Start with the [WalletKit README](https://github.com/ton-connect/kit/blob/main/packages/walletkit/README.md).
- **AgentKit** (`@ton/mcp`) - TON's entry point for machines. It exposes TON to LLM agents through the Model Context Protocol and also includes a CLI for direct tool execution, with one-line MCP client connection, on-chain actions, agentic wallet workflows, and reusable skills from the open repo. Start with the [@ton/mcp README](https://github.com/ton-connect/kit/blob/main/packages/mcp/README.md).

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
