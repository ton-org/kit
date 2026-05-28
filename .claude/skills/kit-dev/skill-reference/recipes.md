# Action / Query / Hook Templates

Use these templates directly. Do NOT read reference files to learn the pattern — these are accurate and complete.

## Action template

Create `packages/appkit/src/actions/<domain>/get-xxx.ts`:

```ts
import type { AppKit } from '../../core/app-kit';

export interface GetXxxOptions { /* ... */ }
export type GetXxxReturnType = Promise<T>;

export const getXxx = async (appKit: AppKit, options: GetXxxOptions = {}): GetXxxReturnType => {
    // business logic here
};
```

Export from `packages/appkit/src/actions/index.ts`.

## Watch action template (subscriptions / live updates)

Use this pattern for any "real-time" or "live" feature — never polling, never `setInterval`. The action subscribes to `appKit.emitter` and returns an unsubscribe function:

```ts
import type { AppKit } from '../../core/app-kit';

export interface WatchXxxParameters {
    onChange: (value: T) => void;
    // ...other inputs
}
export type WatchXxxReturnType = () => void; // unsubscribe

export const watchXxx = (appKit: AppKit, params: WatchXxxParameters): WatchXxxReturnType => {
    const handler = (value: T) => params.onChange(value);
    const unsubscribe = appKit.emitter.on('xxxChanged', handler);
    return unsubscribe;
};
```

Watch actions skip the query layer entirely (no `*QueryOptions`, no `*QueryKey`).

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

export const getXxxQueryKey = (options: Compute<ExactPartial<GetXxxOptions>> = {}): GetXxxQueryKey =>
    ['xxx', filterQueryOptions(options)] as const;

export const getXxxQueryOptions = <selectData = GetXxxData>(
    appKit: AppKit,
    options: GetXxxQueryConfig<selectData> = {},
) => ({
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
import { useAppKit } from '../../../hooks/use-app-kit';
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

Two valid patterns — pick based on whether there's a synchronous current value.

### Pattern A — Snapshot via `useSyncExternalStore`

Use when the action exposes a synchronous current value alongside the subscription (e.g., `getNetworks()` returns immediately):

```ts
import { useSyncExternalStore, useCallback, useRef } from 'react';
import { getXxx, watchXxx } from '@ton/appkit';
import { useAppKit } from '../../settings';

export const useXxx = (): GetXxxReturnType => {
    const appKit = useAppKit();
    const cachedRef = useRef<GetXxxReturnType>(initialValue);

    const subscribe = useCallback(
        (onChange: () => void) => watchXxx(appKit, { onChange }),
        [appKit],
    );
    const getSnapshot = useCallback(() => {
        const next = getXxx(appKit);
        // optional reference-stability check
        return next;
    }, [appKit]);

    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};
```

Reference: `packages/appkit-react/src/features/network/hooks/use-networks.ts`.

### Pattern B — Cache invalidation via `useEffect`

Use when the watched value is async-fetched (returned by a `useXxxQuery`) and you want a parallel hook that keeps that query fresh. The watch hook returns `void`; consumers read the value via the paired `useXxxQuery` hook.

```ts
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { watchXxx, hasStreamingProvider, resolveNetwork } from '@ton/appkit';
import { handleXxxUpdate, getXxxQueryKey } from '@ton/appkit/queries';
import { useAppKit } from '../../settings';

export const useWatchXxx = (parameters: WatchParams): void => {
    const appKit = useAppKit();
    const queryClient = useQueryClient();

    useEffect(() => {
        const resolvedNetwork = resolveNetwork(appKit, parameters.network);
        if (!resolvedNetwork || !hasStreamingProvider(appKit, resolvedNetwork)) return;

        return watchXxx(appKit, {
            ...parameters,
            network: resolvedNetwork,
            onChange: (value) => {
                parameters.onChange?.(value);
                // either write into cache directly...
                handleXxxUpdate(queryClient, parameters, value);
                // ...or invalidate so the next refetch picks up the new value:
                // queryClient.invalidateQueries({ queryKey: getXxxQueryKey(parameters) });
            },
        });
    }, [appKit, queryClient, /* relevant parameter deps */]);
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
