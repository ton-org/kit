/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { getGaslessQuote } from '../../actions/gasless/get-gasless-quote';
import type {
    GetGaslessQuoteErrorType,
    GetGaslessQuoteOptions,
    GetGaslessQuoteReturnType,
} from '../../actions/gasless/get-gasless-quote';
import { getSelectedWallet } from '../../actions/wallets/get-selected-wallet';
import type { AppKit } from '../../core/app-kit';
import type { QueryOptions, QueryParameter } from '../../types/query';
import type { Compute, ExactPartial } from '../../types/utils';
import { filterQueryOptions } from '../../utils';

export type { GetGaslessQuoteErrorType };

/**
 * Default time-to-live for a gasless quote. The relayer returns its own
 * `validUntil`; this is the upper bound used by react-query to refresh the
 * quote before it expires.
 */
export const GASLESS_QUOTE_STALE_TIME_MS = 2 * 60 * 1000;

export type GetGaslessQuoteQueryConfig<selectData = GetGaslessQuoteData> = Compute<
    ExactPartial<GetGaslessQuoteOptions>
> &
    QueryParameter<GetGaslessQuoteQueryFnData, GetGaslessQuoteErrorType, selectData, GetGaslessQuoteQueryKey>;

export const getGaslessQuoteQueryOptions = <selectData = GetGaslessQuoteData>(
    appKit: AppKit,
    options: GetGaslessQuoteQueryConfig<selectData> = {},
): GetGaslessQuoteQueryOptions<selectData> => {
    // The quote is bound to the selected wallet's address and network, both of
    // which `getGaslessQuote` resolves internally. Fold them into the key so a
    // wallet/network switch produces a distinct cache entry and refetch instead
    // of silently serving a quote issued for a different wallet.
    const wallet = getSelectedWallet(appKit);
    const walletAddress = wallet?.getAddress();
    const resolvedOptions = { ...options, network: options.network ?? wallet?.getNetwork() };

    return {
        staleTime: GASLESS_QUOTE_STALE_TIME_MS,
        ...options.query,
        // `feeAsset` is intentionally not part of the gate: free / sponsored
        // providers accept an undefined asset, and jetton-only providers throw
        // a typed error themselves. We require messages and a connected wallet —
        // the action resolves the wallet internally and throws without one, so
        // gating here keeps the query idle instead of erroring (matches the
        // jetton/ton transfer-quote options).
        enabled: Boolean(
            options.messages && options.messages.length > 0 && walletAddress && (options.query?.enabled ?? true),
        ),
        queryFn: async (context) => {
            const [, parameters] = context.queryKey as [string, GetGaslessQuoteOptions, string | undefined];

            if (!parameters.messages || parameters.messages.length === 0) {
                throw new Error('messages is required');
            }

            return getGaslessQuote(appKit, parameters);
        },
        queryKey: getGaslessQuoteQueryKey(resolvedOptions, walletAddress),
    };
};

export type GetGaslessQuoteQueryFnData = Compute<Awaited<GetGaslessQuoteReturnType>>;

export type GetGaslessQuoteData = GetGaslessQuoteQueryFnData;

export const getGaslessQuoteQueryKey = (
    options: Compute<ExactPartial<GetGaslessQuoteOptions>> = {},
    walletAddress?: string,
): GetGaslessQuoteQueryKey => {
    return ['gaslessQuote', filterQueryOptions(options as unknown as Record<string, unknown>), walletAddress] as const;
};

export type GetGaslessQuoteQueryKey = readonly [
    'gaslessQuote',
    Compute<ExactPartial<GetGaslessQuoteOptions>>,
    string | undefined,
];

export type GetGaslessQuoteQueryOptions<selectData = GetGaslessQuoteData> = QueryOptions<
    GetGaslessQuoteQueryFnData,
    GetGaslessQuoteErrorType,
    selectData,
    GetGaslessQuoteQueryKey
>;
