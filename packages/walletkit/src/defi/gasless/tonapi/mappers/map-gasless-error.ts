/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { GaslessErrorCode } from '../../errors';
import { GaslessError } from '../../errors';

// NOTE: TonAPI numeric `error_code` mapping is temporarily disabled — we are not
// yet confident these codes map cleanly to single domain concepts:
//   - 40000 → UNSUPPORTED_FEE_ASSET
//   - 40007 → FEE_ASSET_NOT_OWNED  (40007 is also returned for other resolution
//     failures, so mapping it this way mislabels them)
// Until then every TonAPI error falls back to the caller-provided code + the
// relayer's own message. To restore, re-enable the import + the block inside
// `mapTonApiGaslessError` below.
//
// import { ApiClientHttpError } from '../../../../clients/errors';
//
// // Wire shapes observed in practice:
// //   { "error": "Jetton is not supported.", "error_code": 40000 }
// //   { "error": "failed to resolve jetton master for jetton wallet 0:...", "error_code": 40007 }
// //   { "error": "invalid wallet address" }  (no error_code)
// interface TonApiErrorBody { error?: string; error_code?: number }
// const TONAPI_UNSUPPORTED_FEE_ASSET_CODE = 40000;
// const TONAPI_FEE_JETTON_UNRESOLVED_CODE = 40007;

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

    // Numeric error_code mapping disabled (see note at top of file):
    // if (error instanceof ApiClientHttpError) {
    //     const body = error.details as TonApiErrorBody | undefined;
    //     if (body && typeof body === 'object' && body.error_code === TONAPI_UNSUPPORTED_FEE_ASSET_CODE) {
    //         return new GaslessError(
    //             body.error ?? 'Fee asset is not supported by the gasless relayer',
    //             GaslessErrorCode.UnsupportedFeeAsset,
    //             error,
    //         );
    //     }
    //     if (body && typeof body === 'object' && body.error_code === TONAPI_FEE_JETTON_UNRESOLVED_CODE) {
    //         return new GaslessError(
    //             'You have never held the selected fee asset, so the relayer could not resolve its jetton wallet. Choose a fee asset you already own.',
    //             GaslessErrorCode.FeeAssetNotOwned,
    //             error,
    //         );
    //     }
    // }

    const message = error instanceof Error ? error.message : fallbackMessage;
    return new GaslessError(message, fallbackCode, error);
};
