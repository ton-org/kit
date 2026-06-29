/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

import { defineConfig } from 'vite';

// Vite config for the QA Mock dApp test fixture. `root` is this directory so vite serves
// index.html + bundles main.ts on the fly.
//
// The demo-wallet package does NOT depend on `@tonconnect/sdk` (only walletkit does,
// transitively, so it isn't hoisted to the top-level node_modules). A bare
// `import '@tonconnect/sdk'` is therefore unresolvable from this dir's module graph. The
// package IS installed in the monorepo as a catalog dep used by `appkit-minter`, so we
// resolve it against that package and alias the bare specifier to its ESM entry. Deriving
// the ESM path from the resolved CJS entry avoids relying on a hard-coded `.pnpm` path.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const minterRequire = createRequire(path.resolve(__dirname, '../../../appkit-minter/package.json'));
const sdkCjs = minterRequire.resolve('@tonconnect/sdk'); // .../@tonconnect/sdk/lib/cjs/index.cjs
const sdkEsm = path.resolve(path.dirname(sdkCjs), '../esm/index.mjs');

export default defineConfig({
    root: __dirname,
    server: {
        // `127.0.0.1` (not `localhost`): WalletKit's manifest `isValidHost` guard rejects
        // dot-less hosts before fetching (see main.ts / packages/walletkit/src/utils/url.ts).
        host: '127.0.0.1',
        port: 5175,
        strictPort: true,
    },
    resolve: {
        alias: {
            '@tonconnect/sdk': sdkEsm,
        },
    },
});
