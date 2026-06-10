# appkit-minter e2e

End-to-end tests for the **appkit-minter** demo dApp, focused on the gasless
transaction flows (jetton transfer + NFT mint) built on `@ton/appkit`.

The suite mirrors the structure and tooling of the [`demo-wallet` e2e suite](../../demo-wallet/e2e)
(Playwright + Allure), and reuses the same approach for driving a real wallet.

## Layout

```
apps/appkit-minter/
  e2e.config.ts            Playwright config (boots the minter dev server on :5174)
  e2e/
    constants.ts           Shared test constants (fee asset, recipient, amounts)
    qa/                    Reusable harness (copied from demo-wallet e2e):
      TonConnectWidget.ts    drives the dApp-side TonConnect UI (connect, copy link)
      WalletApp.ts           abstract wallet base
      test.ts                launchPersistentContext, testWith helpers
      util.ts                extension helpers
      index.ts               shared types (ConfigFixture, TestFixture) + exports
    wallet/
      DemoWallet.ts          drives the kit demo wallet; adds signMessage() for gasless
      index.ts
    pages/
      MinterPage.ts          page object for the minter UI (transfer + mint modals)
    mocks/
      gaslessRelayer.ts      page.route() mocks for /v2/gasless/{config,estimate,send}
    fixtures/
      gaslessFixture.ts      two-tab fixture (minter + demo wallet) + connectWallet()
    specs/                   (all gasless-prefixed so they sit alongside the
                             existing general minter UI specs without colliding)
      gasless-availability.spec.ts   §1  — gasless block visibility
      gasless-error-scenarios.spec.ts §11 — relayer error rendering on load (no wallet)
      gasless-transfer.spec.ts        §2/§3/§5/§6 — gasless jetton transfer
      gasless-mint.spec.ts            §9  — gasless NFT mint (settings/confirm/reject)
      gasless-security.spec.ts        §6/§11 — relayer errors, WALLET_MISMATCH, QUOTE_EXPIRED
      gasless-input-edges.spec.ts     §11.10/§11.11 — malformed recipient, empty amount, inert HTML
      gasless-races.spec.ts           §11.6/§11.7 — double-submit guard, fee-asset re-quote
```

> The `qa/` and `wallet/` helpers are duplicated from `demo-wallet/e2e` for now so
> the minter suite is self-contained. They are good candidates for extraction into
> a shared `@ton/e2e-utils` package later.

## Test design: steps are defined in code

Each test name and its steps are authored **in code** (`test.step('…')` + the
`gaslessMeta()` labels), and the TestOps test case is auto-created/updated from the
uploaded run (matched by `fullName`). We deliberately do **not** hand-author the
case scenarios in TestOps.

Why code-defined (vs. describing steps directly in TestOps):

| | Code-defined steps (chosen) | TestOps-authored steps |
|---|---|---|
| Source of truth | the spec — one place | the case — diverges from code |
| Drift | impossible (steps come from the run) | constant (manual sync) |
| New test | appears in TestOps after one run | must be hand-created first |
| Matches repo | yes — demo-wallet/walletkit do this (`allureId`/`suite`/`label` in code) | no |
| Cost for ~60 cases | zero extra | ~60 manual cases to write + maintain |
| Rich "expected result" rows | weaker (body steps) | richer |

The only real downside — slightly less rich step formatting — is outweighed by
zero drift across a fast-moving feature. `detail: false` in the Allure reporter
keeps the TestOps scenario clean (only our `test.step` labels; no Playwright
hook/fixture noise). Plan traceability is preserved via a `§x.y` tag per test.

## Testing approaches

Tests fall into three groups by how the wallet is involved:

1. **No wallet** — render/layout/availability and mocked-relayer checks. No
   connection or signature needed. Run anywhere, fast, deterministic.
   (`availability.spec.ts`, parts of `error-scenarios.spec.ts`.)

2. **Mocked relayer** — `page.route()` intercepts `/v2/gasless/{config,estimate,send}`
   to drive error codes (40000/40007), `WALLET_MISMATCH`, `QUOTE_EXPIRED`, non-BoC
   responses, etc. The dApp-side guards and rendering are asserted without a real
   on-chain send.

3. **Two-tab real wallet** — `gaslessFixture` opens the minter in one tab and the
   kit **demo wallet** (imported from `WALLET_MNEMONIC`) in another. The fixture
   connects them via the TonConnect universal link (copied from the modal) and
   approves/rejects connect / signMessage / sendTransaction requests
   programmatically. This is the full e2e path — real signing through the wallet UI,
   no hand-holding.

## Running locally

```bash
# install Playwright's chromium (once)
pnpm --filter appkit-minter e2e:deps

# --- no-wallet specs only (no mnemonic needed) ---
# the demo-wallet server is skipped when no wallet is required
E2E_WALLET_SOURCE=none pnpm --filter appkit-minter e2e -- --grep "no wallet"

# --- all gate specs (two-tab wallet, mocked relayer) ---
# build BOTH chains so the minter (5174) and the demo wallet (5173) dev servers run
pnpm --filter "appkit-minter..." --filter "demo-wallet..." build
# a SignMessage-capable mainnet V5 wallet that holds the test jetton (e.g. USDT)
WALLET_MNEMONIC="word1 word2 …" pnpm --filter appkit-minter e2e -- --grep-invert "@real-send"

# --- real-send specs (broadcasts real funds on mainnet) ---
WALLET_MNEMONIC="word1 word2 …" pnpm --filter appkit-minter e2e -- --grep "@real-send"
```

Useful env vars:

| Var | Purpose |
|-----|---------|
| `WALLET_MNEMONIC` | seed imported into the demo wallet (two-tab specs); signs locally |
| `MINTER_URL` | run against an already-running minter / deployed preview instead of the dev server |
| `E2E_WALLET_SOURCE` | demo-wallet URL for the wallet tab (default `http://localhost:5173/`); set to a non-`localhost:5173` value to skip booting it |
| `ENABLE_HEADLESS` | `true`/`false` to force headless |

## CI

The relayer is **mocked** in every wallet-based spec (`mocks/gaslessRelayer.ts`),
so the demo wallet signs locally but no gasless transaction is ever broadcast and
no live relayer is contacted on the send path.

`.github/workflows/e2e_appkit_minter.yml` runs on PRs that touch the minter or its
`@ton/appkit*` / `@ton/walletkit` deps (and on dispatch). It runs everything
**except** the `@real-send` specs (`--grep-invert "@real-send"`), spends nothing,
and is independent of the demo-wallet / extension suites — so a failure gates only
the minter PR.

`tx-formation` correctness is still covered in CI without broadcasting: the
`/v2/gasless/send` mock captures the request body and the spec asserts a public
key + non-empty signed BoC — see `gasless-transfer.spec.ts` §5.4 and
`gasless-races.spec.ts`.

The `@real-send` specs (`gasless-transfer.spec.ts` §5.1, `gasless-mint.spec.ts`)
**do broadcast** real mainnet transactions and are therefore **not run in CI** —
they exist for manual/local real-send verification (`pnpm e2e -- --grep "@real-send"`).
A scheduled-monitor workflow that would run them against the live relayer was
considered out of scope here (kept as a QA-side snippet, not in this repo).

Results upload to Allure TestOps (project 368). Cases are **auto-created/updated by
`fullName`** (path:line) on upload — no manual mapping. To harden the link so a
rename/move can't orphan a case, pin the AllureID **after the first run** with a
code call `await allureId(<id>)` (from `allure-js-commons`) — the title-only
`@allureId(N)` tag is decorative in allure-playwright v3 and does not link.

## Notes

- Gasless requires a **Wallet V5** that advertises the `SignMessage` TonConnect
  feature (the demo wallet does; production wallets may not yet).
- Gasless NFT mint is **mainnet-only** (the `MintForward` forwarder is deployed on
  mainnet only).
- The appkit-minter Assets list is **empty without a connected wallet**, so the
  transfer modal is only reachable in two-tab specs; truly wallet-less coverage is
  limited to page-load / mocked-config / mint-settings-disabled checks.
- `LowBalanceModal` (regular mint, insufficient TON) is **not yet automated**: it
  needs either a real 0-TON wallet or a mocked account balance. Since CI must not
  rely on a specially-funded wallet, the plan is to mock the balance endpoint
  rather than add a second mnemonic — see the QA test plan.
