/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * Fade out and remove the pre-React boot splash (see index.html). Called once the
 * app has mounted, so the themed splash hands off to live content without a flash.
 */
export function dismissBootSplash(): void {
    const splash = document.getElementById('boot-splash');
    if (!splash) return;
    splash.style.opacity = '0';
    window.setTimeout(() => splash.remove(), 300);
}
