/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { TonClientError } from '../../../../clients/TonClientError';
import { GaslessError, GaslessErrorCode } from '../../errors';

/**
 * TonAPI gasless responses surface a small undocumented numeric `error_code`
 * inside the error body. Only `40000` ("Jetton is not supported.") maps to a
 * specific domain concept; everything else falls back to the caller-provided
 * code.
 *
 * Wire shape observed in practice:
 *   `{ "error": "Jetton is not supported.", "error_code": 40000 }`
 *   `{ "error": "invalid public key size", "error_code": 40004 }`
 *   `{ "error": "invalid wallet address" }`            (no `error_code`)
 *   `{ "Error": "operation Gasless...: decode ..." }`  (decoder failure, no `error_code`)
 */
interface TonApiErrorBody {
    error?: string;
    error_code?: number;
}

const TONAPI_UNSUPPORTED_FEE_ASSET_CODE = 40000;

export const mapTonApiGaslessError = (
    error: unknown,
    fallbackCode: GaslessErrorCode,
    fallbackMessage: string,
): GaslessError => {
    // Pre-classified `GaslessError`s (e.g. thrown from `getClient` for a
    // non-configured chain) pass through unchanged.
    if (error instanceof GaslessError) {
        return error;
    }

    if (error instanceof TonClientError) {
        const body = error.details as TonApiErrorBody | undefined;

        if (body && typeof body === 'object' && body.error_code === TONAPI_UNSUPPORTED_FEE_ASSET_CODE) {
            return new GaslessError(
                body.error ?? 'Fee asset is not supported by the gasless relayer',
                GaslessErrorCode.UnsupportedFeeAsset,
                error,
            );
        }
    }

    const message = error instanceof Error ? error.message : fallbackMessage;
    return new GaslessError(message, fallbackCode, error);
};
