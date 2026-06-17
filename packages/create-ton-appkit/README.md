# create-ton-appkit

Scaffold a TON AppKit project in seconds.

## Usage

```bash
pnpm create ton-appkit
```

Or with any other package manager:

```bash
npm create ton-appkit
npx create-ton-appkit
yarn create ton-appkit
bunx create-ton-appkit
```

### Non-interactive mode

Pass all options as flags to skip prompts entirely:

```bash
pnpm create ton-appkit my-app --template react --app-url https://example.com -y
```

## Options

| Flag | Alias | Description | Default |
|------|-------|-------------|---------|
| `[project-name]` | | Project directory name | `my-ton-app` |
| `--template <name>` | `-t` | Template to use | `react` |
| `--app-url <url>` | | App URL for TonConnect manifest | `https://your-app.example.com` |
| `--overwrite` | `-o` | Overwrite existing directory | `false` |
| `--yes` | `-y` | Accept all defaults (non-interactive) | `false` |
| `--help` | `-h` | Show help message | |

## Templates

- **react** — Vite + React + TypeScript with wallet connection, balance, jettons, NFTs, swap, and staking

## Documentation

- [Applications overview](https://docs.ton.org/applications/apps-overview)
- [AppKit overview](https://docs.ton.org/applications/appkit/overview)
- [How-to guides](https://docs.ton.org/applications/appkit/howto/howto)
- [TonConnect](https://docs.ton.org/applications/ton-connect/overview)
