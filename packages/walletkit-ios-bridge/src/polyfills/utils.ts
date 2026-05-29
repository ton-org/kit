/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

export function extendAllGlobals(extend: { [key: string]: unknown }) {
    if (typeof window !== 'undefined') {
        extendGlobal(window as unknown as { [key: string]: unknown }, extend);
    }
    if (typeof globalThis !== 'undefined') {
        extendGlobal(globalThis, extend);
    }
    if (typeof global !== 'undefined') {
        extendGlobal(global, extend);
    }
}

export function extendGlobal(globalObj: { [key: string]: unknown }, extend: { [key: string]: unknown }) {
    for (const key of Object.keys(extend)) {
        if (!(key in globalObj)) {
            globalObj[key] = extend[key];
        }
    }
}
