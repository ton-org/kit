/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/** Password used when importing the demo wallet in e2e (>= 4 chars, varied). */
export const TEST_PASSWORD = 'Te1!';

/** USDT jetton master (mainnet) — default fee asset and the jetton we transfer. */
export const USDT_MASTER_MAINNET = 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs';

/**
 * Default recipient for transfer tests — the canonical zero address (valid
 * checksum, parseable). Mocked-relayer specs never broadcast, so the recipient
 * only has to be a well-formed address. For the `@real-send` specs (which DO
 * broadcast), set E2E_RECIPIENT to a real address you control — never send to
 * the zero address for real.
 */
export const DEFAULT_RECIPIENT = process.env.E2E_RECIPIENT ?? 'UQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJKZ';

/** Small jetton amount used in transfer tests. */
export const TRANSFER_AMOUNT = '0.05';
