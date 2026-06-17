# Action / Query / Hook Templates

Use these templates directly. Do NOT read reference files to learn the pattern — these are accurate and complete.

## Action template

Create `packages/appkit/src/actions/<domain>/get-xxx.ts`:

```ts
import type { AppKit } from '../../core/app-kit';

export interface GetXxxOptions { /* input parameters */ }

export type GetXxxReturnType = Promise<{
    /* shape of what your action returns */
}>;

export const getXxx = async (appKit: AppKit, options: GetXxxOptions = {}): GetXxxReturnType => {
    // your business logic here
    return {};
};
```

Export from `packages/appkit/src/actions/index.ts`.

## Watch action template (subscriptions / live updates)

Use this pattern for any "real-time" or "live" feature — never polling, never `setInterval`. The action subscribes to `appKit.emitter`, re-reads the value via the paired `getXxx`, and returns an unsubscribe function.

Create `packages/appkit/src/actions/<domain>/watch-xxx.ts`:

```ts
import type { AppKit } from '../../core/app-kit';

import { getXxx } from './get-xxx';
import type { GetXxxOptions, GetXxxReturnType } from './get-xxx';

export interface WatchXxxParameters extends GetXxxOptions {
    onChange: (value: Awaited<GetXxxReturnType>) => void;
    onError?: (error: unknown) => void;
}

export type WatchXxxReturnType = () => void; // unsubscribe

export const watchXxx = (appKit: AppKit, parameters: WatchXxxParameters): WatchXxxReturnType => {
    const { onChange, onError, ...options } = parameters;
    let cancelled = false;

    const refresh = (): void => {
        getXxx(appKit, options)
            .then((value) => {
                if (cancelled) return;
                onChange(value);
            })
            .catch((error: unknown) => {
                if (cancelled) return;
                onError?.(error);
            });
    };

    // Replace these AppKitEvents keys with the ones that signal a change in your domain.
    const unsubscribeA = appKit.emitter.on('wallets:updated', refresh);
    const unsubscribeB = appKit.emitter.on('networks:updated', refresh);

    return () => {
        cancelled = true;
        unsubscribeA();
        unsubscribeB();
    };
};
```

Watch actions skip the query layer entirely (no `*QueryOptions`, no `*QueryKey`). Resource inputs (`address`, `network`, `id`, …) come from `GetXxxOptions` and must flow through to `getXxx` so the watcher stays scoped — see `packages/appkit/src/actions/balances/watch-balance-by-address.ts`.

## Query template (get-actions only, watch actions skip to Hook)

Create `packages/appkit/src/queries/<domain>/get-xxx.ts`:

```ts
import { getXxx } from '../../actions/<domain>/get-xxx';
import type { GetXxxOptions, GetXxxReturnType } from '../../actions/<domain>/get-xxx';
import type { AppKit } from '../../core/app-kit';
import type { QueryOptions, QueryParameter } from '../../types/query';
import type { Compute, ExactPartial } from '../../types/utils';
import { filterQueryOptions } from '../../utils';

export type GetXxxErrorType = Error;
export type GetXxxQueryFnData = Compute<Awaited<GetXxxReturnType>>;
export type GetXxxData = GetXxxQueryFnData;
export type GetXxxQueryKey = readonly ['xxx', Compute<ExactPartial<GetXxxOptions>>];

export type GetXxxQueryConfig<selectData = GetXxxData> =
    Compute<ExactPartial<GetXxxOptions>> &
    QueryParameter<GetXxxQueryFnData, GetXxxErrorType, selectData, GetXxxQueryKey>;

export type GetXxxQueryOptions<selectData = GetXxxData> = QueryOptions<
    GetXxxQueryFnData,
    GetXxxErrorType,
    selectData,
    GetXxxQueryKey
>;

export const getXxxQueryKey = (options: Compute<ExactPartial<GetXxxOptions>> = {}): GetXxxQueryKey =>
    ['xxx', filterQueryOptions(options)] as const;

export const getXxxQueryOptions = <selectData = GetXxxData>(
    appKit: AppKit,
    options: GetXxxQueryConfig<selectData> = {},
): GetXxxQueryOptions<selectData> => ({
    ...options.query,
    queryFn: async (context: { queryKey: GetXxxQueryKey }) => {
        const [, parameters] = context.queryKey;
        return getXxx(appKit, parameters as GetXxxOptions);
    },
    queryKey: getXxxQueryKey(options),
});
```

For mutations, reference: `packages/appkit/src/queries/transaction/transfer-ton.ts`.
Export from `packages/appkit/src/queries/index.ts`.

## Hook template

Create `packages/appkit-react/src/features/<domain>/hooks/use-xxx.ts`:

```ts
import { getXxxQueryOptions } from '@ton/appkit/queries';
import type { GetXxxData, GetXxxErrorType, GetXxxQueryConfig } from '@ton/appkit/queries';

import { useAppKit } from '../../settings';
import { useQuery } from '../../../libs/query';
import type { UseQueryReturnType } from '../../../libs/query';

export type UseXxxParameters<selectData = GetXxxData> = GetXxxQueryConfig<selectData>;
export type UseXxxReturnType<selectData = GetXxxData> = UseQueryReturnType<selectData, GetXxxErrorType>;

export const useXxx = <selectData = GetXxxData>(
    parameters: UseXxxParameters<selectData> = {},
): UseXxxReturnType<selectData> => {
    const appKit = useAppKit();
    return useQuery(getXxxQueryOptions(appKit, parameters));
};
```

Export from `packages/appkit-react/src/features/<domain>/index.ts`.

## Watch hook templates (paired with watch action)

Two valid patterns — pick based on whether you want the watch hook to expose the value directly (Pattern A) or to keep a sibling TanStack query fresh while consumers read it via `useXxx` (Pattern B).

### Pattern A — Snapshot via `useSyncExternalStore`

The hook caches the most recent value emitted by `watchXxx` and exposes it directly through `useSyncExternalStore`. Returns `null` until the first update fires.

```ts
import { useSyncExternalStore, useCallback, useRef } from 'react';
import { watchXxx } from '@ton/appkit';
import type { WatchXxxParameters } from '@ton/appkit';

import { useAppKit } from '../../settings';

type XxxValue = Parameters<WatchXxxParameters['onChange']>[0];

export type UseXxxReturnType = XxxValue | null;

export const useXxx = (): UseXxxReturnType => {
    const appKit = useAppKit();
    const cachedRef = useRef<XxxValue | null>(null);

    const subscribe = useCallback(
        (onChange: () => void) =>
            watchXxx(appKit, {
                onChange: (value) => {
                    cachedRef.current = value;
                    onChange();
                },
            }),
        [appKit],
    );

    const getSnapshot = useCallback(() => cachedRef.current, []);

    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};
```

Reference: `packages/appkit-react/src/features/network/hooks/use-networks.ts`.

### Pattern B — Cache invalidation via `useEffect`

Use when consumers already read the value via a paired `useXxx` (TanStack Query). The watch hook returns `void` and only nudges the query cache so the next read sees the latest value.

```ts
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { watchXxx } from '@ton/appkit';
import type { WatchXxxParameters } from '@ton/appkit';
import { getXxxQueryKey } from '@ton/appkit/queries';

import { useAppKit } from '../../settings';

export type UseWatchXxxParameters = Partial<WatchXxxParameters>;

export const useWatchXxx = (parameters: UseWatchXxxParameters = {}): void => {
    const { onChange, onError, ...options } = parameters;
    const appKit = useAppKit();
    const queryClient = useQueryClient();

    useEffect(() => {
        return watchXxx(appKit, {
            ...options,
            onError,
            onChange: (value) => {
                onChange?.(value);
                // Invalidate the scoped key so the paired `useXxx(options)` re-reads the fresh value:
                queryClient.invalidateQueries({ queryKey: getXxxQueryKey(options) });
                // Or write straight into cache via a hand-written `handleXxxUpdate(queryClient, options, value)`
                // — see packages/appkit/src/queries/balances/get-balance-by-address.ts for an example.
            },
        });
        // List each resource option (e.g. `address`, `network`) in the deps, not the `options` object itself.
    }, [appKit, queryClient, onChange, onError]);
};
```

Reference: `packages/appkit-react/src/features/balances/hooks/use-watch-balance-by-address.ts`.

## Examples

Action example in `demo/examples/src/appkit/actions/<domain>/get-xxx.ts` with `SAMPLE_START: GET_XXX` / `SAMPLE_END: GET_XXX` markers.
Hook example in `demo/examples/src/appkit/hooks/<domain>/use-xxx.tsx` with same pattern.
Export from domain `index.ts`. Add tests to existing `<domain>.test.ts`.

## Docs

1. `template/packages/appkit/docs/actions.md`: `%%demo/examples/src/appkit/actions/<domain>#GET_XXX%%`
2. `template/packages/appkit-react/docs/hooks.md` similarly.
3. `pnpm docs:update` then `pnpm quality`.

## Completion Checklist

- [ ] Action exported from `packages/appkit/src/actions/index.ts`
- [ ] Query/mutation exported from `packages/appkit/src/queries/index.ts`
- [ ] Hook exported from `packages/appkit-react/src/features/<domain>/index.ts`
- [ ] Walletkit types through local barrel (never direct `@ton/walletkit` in appkit)
- [ ] Examples with `SAMPLE_START`/`SAMPLE_END` markers
- [ ] Tests added to existing domain test file
- [ ] `pnpm docs:update` + `pnpm quality`
