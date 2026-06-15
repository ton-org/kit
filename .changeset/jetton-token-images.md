---
"@ton/walletkit": major
"@ton/appkit": major
"@ton/appkit-react": minor
"@ton/mcp": patch
---

Unify jetton and token image handling around ordered URL arrays.

**Breaking changes**

- `JettonInfo.image?: string` is replaced by `JettonInfo.images?: string[]` (ordered best-first). Read `info.images?.[0]` where you previously read `info.image`.
- `TokenImage` no longer exposes the discrete `url` / `smallUrl` / `mediumUrl` / `largeUrl` fields. It now exposes a single `urls: string[]` (ordered best-first) alongside the existing `data`. Read `image.urls[0]` where you previously read `image.url`.
- `ApiClient.jettonsByAddress()` now resolves to the normalized `JettonMastersResponse` (`{ masters, addressBook }`) instead of the raw toncenter response. Both the toncenter and tonapi clients map into this shape via shared jetton-masters mappers. The new `JettonMastersResponse` type is exported from `@ton/walletkit`.
- `@ton/appkit`'s `getJettonInfo()` now returns the normalized jetton master (carrying `images`), mirroring the walletkit change.

**Additions**

- `@ton/appkit-react` now exports a `FallbackImage` component that renders the first usable URL from a candidate list and falls back gracefully when an image fails to load.
