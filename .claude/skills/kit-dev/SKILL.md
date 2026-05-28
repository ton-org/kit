---
name: kit-dev
description: Guides development across the @ton/kit monorepo (walletkit, appkit, appkit-react) — adding actions, queries, hooks, and components inside the SDK packages, fixing bugs in source, writing tests, creating examples and docs, and reviewing PRs. Covers SDK-internal concerns: cache invalidation patterns, query key naming, streaming provider plumbing, walletkit-package boundary, action/hook templates, and monorepo architecture. Activates when editing files under `packages/walletkit*`, `packages/appkit*`, or making changes to the SDK itself.
---

# Kit Development Guide

Provides patterns, templates, and routing for the @ton/kit monorepo (walletkit, appkit, appkit-react). Assumes familiarity with TypeScript, React, and TanStack Query.

## Architecture

```
@ton/appkit-react  →  @ton/appkit  →  @ton/walletkit
(hooks, UI, CSS)      (actions, queries, connectors)   (wallet ops, DeFi)
```

**appkit**: Actions (`src/actions/<domain>/`), Queries (`src/queries/<domain>/`), Core (`src/core/` — `AppKit`, `WalletsManager`, `AppKitNetworkManager`, `EventEmitter`, `AppKitCache`), Connectors (`src/connectors/`).
**appkit-react**: Hooks (`src/features/<domain>/hooks/`), Components, Providers (`AppKitProvider` in `src/providers/`).

Principles: business logic in `appkit` not React. Event-driven via `AppKit.emitter`. Named exports only.

## Task Routing

Do NOT glob directories listed below — the structure is documented. Do NOT read barrel index files to learn export patterns — add exports to the matching `// Domain` section comment.

**Adding action/hook:** Read [skill-reference/recipes.md](skill-reference/recipes.md) for complete code templates. Read ONE reference file in the same domain (see table). Do NOT read `src/types/query.ts` or `src/utils/` — templates already include correct imports.

**Adding staking/swap feature needing new walletkit types:** Walletkit manager methods follow `this.getProvider(providerId).methodName(userAddress, network)` with `this.createError(...)` wrapping. Staking barrel (`appkit/src/staking/index.ts`) re-exports: `StakingProvider`, `UnstakeMode`, `StakingError`, `StakingManager`, `StakeParams`, `StakingAPI`, `StakingQuote`, `StakingQuoteParams`, `StakingQuoteDirection`, `StakingBalance`, `StakingProviderInfo`, `StakingProviderInterface`, `StakingProviderMetadata`, `StakingTokenInfo`. Swap barrel (`appkit/src/swap/index.ts`) re-exports: `SwapProvider`, `SwapManager`, `SwapToken`, `TokenAmount`, `SwapParams`, `SwapAPI`, `SwapQuote`, `SwapQuoteParams`. Add new type re-exports to the matching barrel.

**Writing tests:** Read the source file being tested + ONE existing test in the same domain for pattern. Do NOT read multiple test files — they all follow the same pattern. Use `createWrapper` from `demo/examples/src/__tests__/test-utils.tsx` and mocking patterns below.

**Debugging balance/cache (e.g. balance doesn't update after send):** Walk through gotchas #7 (cache invalidation after mutations), #8 (streaming opt-in per network), #11 (network mismatch — app on one network while provider registered for another → balance silently stale), and #12 (provider wiring). Mention each as a possible cause when diagnosing. Key files: `appkit/src/queries/balances/get-balance-by-address.ts` (`handleBalanceUpdate`), `appkit-react/src/features/balances/hooks/use-watch-balance-by-address.ts`, `appkit/src/core/app-kit/services/app-kit.ts` (`registerProvider`).

**Debugging disconnect/stale data:** Key file: `appkit-react/src/features/wallets/hooks/use-disconnect.ts`. Fix: add `removeQueries` for wallet-scoped key prefixes in `onSuccess`. **Preserve callback composition** — call the user's `parameters.mutation?.onSuccess?.(...args)` after the cleanup so consumers' callbacks still fire. **Tests live in `demo/examples/src/appkit/hooks/wallets/wallets.test.tsx`** — add cases to the existing `UseDisconnectExample` describe block asserting each wallet-scoped key is removed and the user's callback still fires. Query key prefixes are listed below — do NOT read query files to discover them.

**Adding UI component:** Reference: `packages/appkit-react/src/components/ui/block`. Reusable primitives (button, input, modal, skeleton, dialog, etc.) → `src/components/ui/<name>/`. Composite shared components that mix business logic (e.g. button-with-connect, low-balance-modal) → `src/components/shared/<name>/`. Feature-specific → `src/features/<feature>/components/<name>/`. Each gets `index.ts`, `<name>.tsx`, `<name>.module.css`, `<name>.stories.tsx`. Use `FC`, named exports, `clsx`, CSS Modules. **Available `--ta-*` design tokens** (from `src/styles/index.css` — names are exact, do not guess): `--ta-color-{primary, primary-foreground, primary-light, error, success, text, text-secondary, text-tertiary, background, background-secondary, background-tertiary, background-bezeled, block, block-foreground, white, black, ton}`, `--ta-border-radius-{s,m,l,xl,2xl,full}`, `--ta-border-width-{s,m}`, typography (`--ta-font-family`, `--ta-body-*`, `--ta-headline-*`, `--ta-display-*`, etc.). For semantic errors/destructive states use `--ta-color-error` (there is **no** `--ta-color-negative` or `--ta-color-danger`). Use `var(--ta-foo)` WITHOUT fallback values (no `var(--ta-foo, 16px)`). **There are no `--ta-spacing-*` tokens** — for `padding`/`gap`/`margin` use literal `px` (consistent with existing components like button), or add a new token to `src/styles/index.css` first if the value will be reused across components. Component-internal dimensions (icon size, fixed primitive widths) also use literal `px` — e.g. button uses `width: 18px` for icon slots. Do NOT invent tokens that don't exist (e.g. `var(--ta-spacing-m)` will silently fall back to nothing). Typography via `composes` from `src/styles/typography.module.css`. **User-facing strings go through i18n**: `import { useI18n } from '../../../settings/hooks/use-i18n'` (adjust depth) and `const { t } = useI18n()`; reference keys via dot-notation, e.g. `t('nft.onSale')`. Add new keys to the dict in `src/locales/en.ts` (loaded by `src/libs/i18n.ts`). Do NOT hardcode user-visible English literals in JSX. For components that consume hooks (queries/mutations), destructure and render all four states explicitly: `isLoading`, `isError`/`error`, empty, and success.

## Walletkit Boundary

**For new actions, queries, hooks**: import walletkit types through the local appkit barrels rather than `@ton/walletkit` directly:
- staking → `../../staking` (barrel: `src/staking/index.ts`)
- swap → `../../swap` (barrel: `src/swap/index.ts`)
- streaming → `../../core/streaming` (barrel: `src/core/streaming/index.ts`)

If you need a walletkit type that isn't re-exported yet, add the re-export to the matching domain barrel first, then import from there.

**A new read-action requires all three layers** (action + query + hook) unless the user explicitly opts out — never deliver only the action file. After creating them, add exports to all three barrels: `packages/appkit/src/actions/index.ts`, `packages/appkit/src/queries/index.ts`, and `packages/appkit-react/src/features/<domain>/index.ts`. Skipping the query/hook or the barrel updates leaves the feature unreachable from consumers.

**Existing exceptions**: low-level core/types/connectors files (`src/types/*.ts`, `src/core/app-kit/services/app-kit.ts`, `src/connectors/tonconnect/**`) still import `@ton/walletkit` directly — that's pre-existing and not in scope to change unless the user asks. The barrel rule is mandatory for new domain-level (actions/queries/hooks) code, not for these foundational layers.

## Feature Domains

| Domain | Actions dir | Hooks dir | Reference action → query → hook |
|---|---|---|---|
| balances | `actions/balances/` | `features/balances/` | `get-balance-by-address` → query `get-balance-by-address` → `use-balance(-by-address)` (the unparameterized `get-balance` is a thin wrapper that calls the `-by-address` action with the selected wallet) |
| staking | `actions/staking/` | `features/staking/` | `get-staked-balance` → query `get-staked-balance` → `use-staked-balance` |
| swap | `actions/swap/` | `features/swap/` | `get-swap-quote` → query `get-swap-quote` → `use-swap-quote` |
| jettons | `actions/jettons/` | `features/jettons/` | `get-jettons-by-address` → query `get-jettons-by-address` → `use-jettons-by-address` (`use-jettons` is a thin wrapper for the selected wallet) |
| nft | `actions/nft/` | `features/nft/` | `get-nfts-by-address` → query `get-nfts-by-address` → `use-nfts(-by-address)` |
| signing | `actions/signing/` | `features/signing/` | `sign-text` → mutation `sign-text` → `use-sign-text` |
| network | `actions/network/` | `features/network/` | `get-networks` (watch-based, no query) → `use-networks` |
| connectors | `actions/connectors/` | `features/wallets/` | `connect` → mutation `connect` → `use-connect` |
| transaction | `actions/transaction/` | `features/transaction/` | `transfer-ton` → mutation `transfer-ton` → `use-transfer-ton` |

All actions dirs under `packages/appkit/src/actions/`. All hooks dirs under `packages/appkit-react/src/`.
Barrel exports: `packages/appkit/src/actions/index.ts`, `packages/appkit/src/queries/index.ts`, `packages/appkit-react/src/features/<domain>/index.ts`.

Action naming: `getXxx` (read), `watchXxx` (subscribe), `transferXxx`/`sendTransaction` (write), `setXxx` (local state), `buildXxxTransaction` (construct unsigned tx).

## Query Key Prefixes

For cache invalidation/removal. TanStack Query prefix-matches on first element:

| Key prefix | Used by |
|---|---|
| `['balance', { address, network }]` | balance queries |
| `['nfts', { address, network }]` | NFT list |
| `['nft', { address, network? }]` | single NFT (`address` is the NFT item address — NOT `tokenAddress`) |
| `['jettons', { address, network }]` | jetton list |
| `['jetton-balance', ...]` | jetton balances |
| `['jetton-info', ...]` | jetton metadata |
| `['jetton-wallet-address', ...]` | jetton wallet address |
| `['stakedBalance', ...]` | staked balance |
| `['stakingProviderInfo', ...]` | staking provider info |
| `['stakingQuote', ...]` | staking quotes |
| `['swapQuote', { amount, from, to }]` | swap quotes |
| `['blockNumber', ...]` | block number |
| `['transactionStatus', ...]` | transaction status |

## Layer Boundary

| Concern | Layer |
|---|---|
| Business logic, fetch, transform | `appkit` actions |
| TanStack Query wrappers (queryKey, queryFn) | `appkit` queries |
| QueryClient ops (invalidate, remove) | `appkit-react` hooks |
| useSyncExternalStore, useQuery, useMutation | `appkit-react` hooks |

## Testing

Vitest. `node` env for appkit, `happy-dom` for demo/examples. Tests live under `demo/examples/src/appkit/` — add to the existing domain test file (e.g. `hooks/wallets/wallets.test.tsx`, `actions/balances/balances.test.ts`). Do NOT create new test files per example. There are no colocated tests inside `packages/appkit-react` or `packages/appkit`.

**Action test** — real `AppKit` + spy:
```ts
const appKit = new AppKit({ networks: { [Network.mainnet().chainId]: {} } });
vi.spyOn(appKit.networkManager, 'getClient').mockReturnValue(mockClient);
```

**Hook test** — providers + `retry: false` + test loading/success/error:
```tsx
const createWrapper = (appKit: AppKit) => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={qc}>
            <AppKitProvider appKit={appKit}>{children}</AppKitProvider>
        </QueryClientProvider>
    );
};
```

**Mocking:**
- API client: `vi.spyOn(appKit.networkManager, 'getClient').mockReturnValue(mock)`
- SwapManager: `Object.defineProperty(appKit, 'swapManager', { value: { getQuote: vi.fn() } })`
- Emitter: `{ on: vi.fn().mockReturnValue(() => {}), off: vi.fn() }`

**Test conflict:** `demo/examples/src/appkit/hooks/swap/swap.test.tsx` has module-level `vi.mock('@ton/appkit-react')` — test the real hook in a separate file.

Existing helpers: `demo/examples/src/__tests__/test-utils.tsx` (`createWrapper`), `demo/examples/src/__mocks__/`.

## Common Gotchas

1. **Walletkit imports** — grep `packages/appkit` for `from '@ton/walletkit'`. Route through barrels.
2. **Thin hooks** — logic in actions, only QueryClient access in hooks.
3. **Two watch hook patterns** (codebase has both):
   - **Snapshot pattern** — `useSyncExternalStore(subscribe, getSnapshot, getSnapshot)` when the action exposes a synchronous current value (`getNetworks()` returns now). Reference: `use-networks.ts`. No TanStack Query.
   - **Cache-invalidation pattern** — `useEffect` that calls the watch action and writes updates into the TanStack Query cache (`handleBalanceUpdate`, or `queryClient.invalidateQueries`). Hook returns void; consumers use the paired query hook for the value. Reference: `use-watch-balance-by-address.ts`. Pick this when the value is async-fetched and you want a `useXxx` query hook to stay fresh.
4. **Do NOT create new test files** per example — add to the existing domain test file in `demo/examples/src/appkit/`.
5. **`pnpm docs:update`** after example/template changes, then `pnpm quality`.
6. **Files under 200-250 lines.**
7. **Cache after mutations** — `invalidateQueries` after transfers, `removeQueries` after disconnect. React-layer concern. Use query key prefixes from table above.
8. **Streaming is opt-in, per network** — register a streaming provider for EACH network the app uses (mainnet AND testnet separately) via `AppKit.registerProvider()` (types: `swap`/`staking`/`streaming`) or `appKit.streamingManager.registerProvider({ network, ... })`. Without it `useWatchBalance` silently skips. One provider doesn't cover other networks.
9. **Serialize BigInt** — `.toString()` at boundaries.
10. **SSR** — `'use client'` for providers, `ssr: true`, gate wallet UI until mount.
11. **Network mismatch** — compare `defaultNetwork`, `useNetwork()`, tx network. Mainnet: `-239`, testnet: `-3`.
12. **AppKitProvider needs QueryClientProvider** — does not create its own.
13. **Transaction errors** — distinguish user rejection (`reject`/`cancel`/`abort`) from network errors. `isPending` disables submit. `reset()` for retry.
14. **Always include examples and tests** when adding public actions/hooks — `SAMPLE_START`/`SAMPLE_END` markers required.
