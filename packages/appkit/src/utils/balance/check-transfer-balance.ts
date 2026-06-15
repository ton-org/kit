/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { formatUnits, parseUnits } from '@ton/walletkit';

import { checkTonBalance } from './check-ton-balance';
import type { CheckTonBalanceParams } from './check-ton-balance';

/**
 * Default headroom baked into the suggested reduced amount, on top of the gas buffer.
 * Covers quote/gas drift between the current built tx and the one sent after the
 * amount changes. 0.02 GRAM.
 */
export const DEFAULT_SAFETY_MARGIN_NANOS = 20_000_000n;

export interface CheckTransferBalanceParams extends CheckTonBalanceParams {
    /** The asset being transferred / swapped. GRAM-from enables the `'reduce'` outcome. */
    fromToken: { address: string };
    /** Amount of `fromToken` being sent, as a decimal string in `fromToken` units. */
    fromAmount: string;
    /**
     * Headroom baked into the suggested reduced amount when the recovery mode is `'reduce'`.
     * Defaults to {@link DEFAULT_SAFETY_MARGIN_NANOS}.
     */
    safetyMarginNanos?: bigint;
}

export type TransferShortfall =
    | { mode: 'reduce'; requiredNanos: bigint; suggestedFromAmount: string }
    | { mode: 'topup'; requiredNanos: bigint };

/**
 * Balance check for user-initiated transfers (send GRAM / jetton / NFT) and swaps —
 * where the user controls a `fromAmount` and might be able to fix a shortfall by
 * sending less.
 *
 * Returns:
 * - `undefined` when balance is sufficient (or unloaded — see {@link checkTonBalance}).
 * - `{ mode: 'reduce', suggestedFromAmount }` only when `fromToken` is GRAM and the
 *   remaining balance can still cover gas — the user can keep going by spending less.
 * - `{ mode: 'topup' }` otherwise (reducing wouldn't free up GRAM gas).
 *
 * Gasless availability is intentionally **not** modelled here — that's a UI policy.
 * Caller maps `'topup'` to `'gasless'` when a gasless alternative is on the table.
 */
export const checkTransferBalance = ({
    messages,
    tonBalance,
    gasBufferNanos,
    fromToken,
    fromAmount,
    safetyMarginNanos = DEFAULT_SAFETY_MARGIN_NANOS,
}: CheckTransferBalanceParams): TransferShortfall | undefined => {
    const shortfall = checkTonBalance({ messages, tonBalance, gasBufferNanos });
    if (!shortfall) return undefined;

    // Reducing the user's own amount only helps when the outflow is in GRAM.
    // For jetton / NFT outflow, gas is denominated in GRAM regardless — reducing
    // the jetton-side input doesn't free up any GRAM.
    if (fromToken.address !== 'ton') {
        return { mode: 'topup', requiredNanos: shortfall.requiredNanos };
    }

    // We know `tonBalance !== undefined` because checkTonBalance returned a shortfall
    // (it short-circuits on undefined balance).
    const totalOutNanos = messages.reduce((acc, m) => acc + BigInt(m.amount), 0n);
    const fromAmountNanos = parseUnits(fromAmount, 9);
    const gasOnlyNanos = totalOutNanos - fromAmountNanos;
    const nonSpendReservedNanos = gasOnlyNanos + gasBufferNanos + safetyMarginNanos;
    const tonBalanceNanos = parseUnits(tonBalance as string, 9);

    if (tonBalanceNanos <= nonSpendReservedNanos) {
        // Even gas doesn't fit — reducing the spend amount won't help.
        return { mode: 'topup', requiredNanos: shortfall.requiredNanos };
    }

    const suggestedFromAmount = formatUnits(tonBalanceNanos - nonSpendReservedNanos, 9);
    return { mode: 'reduce', requiredNanos: shortfall.requiredNanos, suggestedFromAmount };
};
