---
"@ton/appkit-react": minor
---

Rebrand the native asset display from TON to GRAM in the UI. User-facing labels now read GRAM instead of TON:

- Balance "Send" labels now read "Send {{ amount }} GRAM".
- Low-balance modal now reads "Not enough GRAM", and the reduce / top-up / gasless messages reference the GRAM balance.
- The native-asset icon is now the GRAM mark: added `GramIconCircle` (and a `--ta-color-gram` token); the amount preview and staking balance block render it for the native asset.

Technical identifiers are unchanged (the `'ton'` token address, `AssetType.ton`, field names, locale keys). The `TonIcon` / `TonIconCircle` components and the SDK branding ("TON AppKit") are kept.
