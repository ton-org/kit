---
"@ton/walletkit": patch
"@ton/appkit": patch
"@ton/appkit-react": patch
---

Add support for custom providers — third-party providers (`type: 'custom'`) that expose their own methods rather than an SDK-defined API. Register one with `registerProvider`, then retrieve it by id; pass the expected type as a generic argument to narrow the result.

**@ton/walletkit**

- New `CustomProvidersManager` (keyed by `providerId`) and the `CustomProvider` interface, both exported from the package root.
- Custom providers are registered through the existing `registerProvider` flow and reachable via the `customProviders` getter on the kit.
- `getProvider<T extends CustomProvider>(id)` returns the registered provider (or `undefined`), narrowed to `T`.

**@ton/appkit**

- New `getCustomProvider(appKit, { id })` action, returning the provider narrowed to the generic type argument, and `watchCustomProviders(appKit, { onChange })` to react to registrations.
- Re-exports the `CustomProvider` type and exposes `customProvidersManager` on `AppKit`.

**@ton/appkit-react**

- New `useCustomProvider<T>(id)` hook — reads a custom provider by id and re-renders when custom providers are registered.
