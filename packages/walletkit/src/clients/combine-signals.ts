/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * Combines a caller-provided abort signal with the client's internal timeout
 * signal into one: the result aborts when *either* fires. Uses native
 * `AbortSignal.any` where available, falling back to manual listener wiring on
 * older runtimes (some mobile WebViews) so a caller's abort is still honored.
 */
export function combineSignals(external: AbortSignal | undefined, internal: AbortSignal): AbortSignal {
    if (!external) {
        return internal;
    }
    if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.any === 'function') {
        return AbortSignal.any([external, internal]);
    }
    const controller = new AbortController();
    const abortWith = (signal: AbortSignal) => () => {
        if (!controller.signal.aborted) {
            controller.abort(signal.reason);
        }
    };
    if (external.aborted) {
        controller.abort(external.reason);
    } else if (internal.aborted) {
        controller.abort(internal.reason);
    } else {
        external.addEventListener('abort', abortWith(external), { once: true });
        internal.addEventListener('abort', abortWith(internal), { once: true });
    }
    return controller.signal;
}
