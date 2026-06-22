/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * Where the dApp wants the user sent back after a connection. The dApp passes
 * its own URL as a `ret` query param on the TON Connect link; we stash it so it
 * survives the in-app navigation between the `/ton-connect` route and the
 * approval modal on the dashboard.
 */
const RETURN_TARGET_KEY = 'demo-wallet:tonconnect-return';

/** Remember the dApp's return URL (the `ret` param) for the current request. */
export function rememberReturnTarget(url: string): void {
    try {
        const ret = new URL(url).searchParams.get('ret');
        if (ret) {
            window.sessionStorage.setItem(RETURN_TARGET_KEY, ret);
        } else {
            window.sessionStorage.removeItem(RETURN_TARGET_KEY);
        }
    } catch {
        // Ignore malformed URLs — there's simply nowhere to return to.
    }
}

/**
 * Return the user to the dApp after they approve a request. Only acts when a
 * dApp actually asked us to return (a `ret` was captured) — so a request from a
 * wallet we opened ourselves, or from a dApp that didn't pass `ret`, leaves the
 * tab alone.
 *
 * We navigate the current tab back to the dApp rather than calling
 * `window.close()`. Closing looks tidier when the wallet runs in its own pop-up
 * tab, but inside an embedded/in-app browser (an IDE preview pane, a web view)
 * there are no separate tabs, so `window.close()` tears down the whole browser
 * surface and strands the user the moment they confirm. Redirecting reliably
 * lands them back in the dApp in every environment.
 */
export function returnToDapp(): void {
    const ret = window.sessionStorage.getItem(RETURN_TARGET_KEY);
    if (!ret) {
        return;
    }
    window.sessionStorage.removeItem(RETURN_TARGET_KEY);

    window.location.href = ret;
}
