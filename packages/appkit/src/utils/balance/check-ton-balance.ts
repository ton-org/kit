/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { parseUnits } from '@ton/walletkit';

export interface CheckTonBalanceParams {
    /** Outgoing messages of the built transaction — each `amount` is the TON value in nanos. */
    messages: Array<{ amount: string }>;
    /**
     * User's TON balance as a decimal string (`formatUnits(balance, 9)` format).
     * `undefined` means "not loaded yet" — function returns `undefined` (no judgement).
     */
    tonBalance: string | undefined;
    /** Extra TON headroom on top of total outflow. Caller-supplied — no opinion on default. */
    gasBufferNanos: bigint;
}

export interface TonBalanceShortfall {
    /** Total TON the user wallet must hold for the transaction to land. */
    requiredNanos: bigint;
}

/**
 * Pure balance check: does the user have enough TON for the built transaction?
 *
 * Returns `undefined` when the balance is sufficient OR when it hasn't loaded
 * yet (treating unloaded as "unknown" rather than "zero" avoids false-positive
 * shortfalls flashing on first render).
 *
 * No mode classification — this hook reports only "shortfall exists, here's
 * how much was needed." Callers decide what to suggest (topup, gasless,
 * reduce, etc.). For transfer/swap flows where the user can reduce their own
 * outflow, compose this with `checkTransferBalance`.
 */
export const checkTonBalance = ({
    messages,
    tonBalance,
    gasBufferNanos,
}: CheckTonBalanceParams): TonBalanceShortfall | undefined => {
    if (tonBalance === undefined) return undefined;

    const totalOutNanos = messages.reduce((acc, m) => acc + BigInt(m.amount), 0n);
    const requiredNanos = totalOutNanos + gasBufferNanos;
    const tonBalanceNanos = parseUnits(tonBalance, 9);

    if (tonBalanceNanos >= requiredNanos) return undefined;
    return { requiredNanos };
};
