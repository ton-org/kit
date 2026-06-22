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
 * tab alone. The dApp opened us in a new tab, so closing it hands focus straight
 * back; if the browser refuses to close the tab (it wasn't script-opened), we
 * redirect to the saved URL instead so the user still ends up back in the dApp.
 */
export function returnToDapp(): void {
    const ret = window.sessionStorage.getItem(RETURN_TARGET_KEY);
    if (!ret) {
        return;
    }
    window.sessionStorage.removeItem(RETURN_TARGET_KEY);

    window.close();

    window.setTimeout(() => {
        window.location.href = ret;
    }, 150);
}
