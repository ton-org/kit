/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { init, openTelegramLink as openTgLink, retrieveLaunchParams } from '@telegram-apps/sdk';

// Initialize the SDK so its helpers can reach the native Telegram client.
try {
    init();
} catch {
    /* not inside a Telegram Mini App */
}

/** Telegram user id from the Mini App launch params, or undefined outside Telegram. */
export function getTelegramId(): number | undefined {
    try {
        return retrieveLaunchParams(true).tgWebAppData?.user?.id;
    } catch {
        return undefined;
    }
}

/** Open a t.me link inside Telegram, falling back to a new browser tab. */
export function openTelegramLink(url: string): void {
    if (openTgLink.isAvailable()) {
        openTgLink(url);
        return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
}
