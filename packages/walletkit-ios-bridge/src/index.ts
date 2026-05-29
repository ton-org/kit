/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import textEncoder from './polyfills/textEncoder';
if (typeof window !== 'undefined') {
    textEncoder(window);
}
if (typeof globalThis !== 'undefined') {
    textEncoder(globalThis);
    if (typeof window !== 'undefined') {
        self.fetch = window.fetch;
    }
}
if (typeof global !== 'undefined') {
    textEncoder(global);
    if (typeof window !== 'undefined') {
        self.fetch = window.fetch;
    }
}

if (typeof self !== 'undefined') {
    textEncoder(self);
    if (typeof window !== 'undefined') {
        self.fetch = window.fetch;
    }
}

const polyfills = ['./polyfills/buffer', './polyfills/url', './polyfills/generic'] as const;

const polyfillImports: Record<(typeof polyfills)[number], () => Promise<unknown>> = {
    './polyfills/buffer': () => import('./polyfills/buffer'),
    './polyfills/url': () => import('./polyfills/url'),
    './polyfills/generic': () => import('./polyfills/generic'),
};

async function bootstrap() {
    let loading = 'polyfills';

    try {
        for (const polyfill of polyfills) {
            loading = polyfill;
            await polyfillImports[polyfill]();
        }

        loading = './main';
        await import('./main');
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`🔍 Error loading ${loading}:`, error instanceof Error ? error.toString() : String(error));
    }
}

void bootstrap();
