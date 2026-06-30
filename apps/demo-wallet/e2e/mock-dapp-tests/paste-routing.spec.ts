/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { expect } from '@playwright/test';

import { mockDappFixture } from '../ton-connect/mockDappFixture';

/**
 * Mock-first two-tab TON Connect — global clipboard paste routing (test-plan §18.2 + §18.4).
 *
 * The wallet's global `usePasteHandler` (use-paste-handler.ts) listens on `document` and, when a
 * pasted string starts with `tc://` / `ton://` / `http(s)://`, routes it to `handleTonConnectUrl`
 * (which raises the connect-request modal). It is wired with `isDisabled = isConnectOpen`
 * (dashboard-header.tsx), so it is SUPPRESSED while the Connect-to-dApp paste modal is open — to
 * avoid double-handling alongside that modal's own textarea.
 *
 * - §18.2: a real `tc://` connect link pasted globally auto-routes → connect-request modal appears;
 *   and with the paste modal open, the same global paste is suppressed (no connect-request modal).
 * - §18.4: non-TON garbage text pasted globally is ignored (no connect-request modal).
 *
 * Paste is simulated by dispatching a synthetic `ClipboardEvent('paste')` on `document` carrying the
 * text in a `DataTransfer` — exactly the shape `usePasteHandler` reads (`clipboardData.getData`).
 */
const test = mockDappFixture();

test.describe('TON Connect mock-dApp — global paste routing (two-tab)', () => {
    test('§18.2 A real tc:// link pasted globally auto-routes to the connect-request modal', async ({
        wallet,
        dapp,
    }) => {
        const url = await dapp.connectUrl();
        expect(url.startsWith('tc://')).toBe(true);

        // Paste the connect link anywhere on the page (no paste modal involved).
        await wallet.pasteIntoDocument(url);

        // It routes through handleTonConnectUrl → the redesigned connect-request modal shows.
        await wallet.expectConnectModal();

        // Clean up: reject the routed connect request.
        await wallet.connect(false);
    });

    test('§18.2 Global paste is suppressed while the Connect-to-dApp paste modal is open', async ({ wallet }) => {
        // Open the paste modal — this sets isConnectOpen=true → the global paste handler unsubscribes.
        await wallet.openPasteModal();

        // A global paste of a tc:// link must NOT raise a (second) connect-request modal: it is
        // suppressed while the paste modal owns the connect flow.
        await wallet.pasteIntoDocument('tc://suppressed-while-paste-modal-open');
        await wallet.expectNoRequestModal(['connect-request']);
    });

    test('§18.4 Non-TON clipboard text pasted globally is ignored', async ({ wallet }) => {
        // Random garbage that matches none of the tc:// / ton:// / http(s):// prefixes.
        await wallet.pasteIntoDocument('just some random clipboard noise — not a TON Connect link');
        await wallet.expectNoRequestModal(['connect-request']);
    });
});
