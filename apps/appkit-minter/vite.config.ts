/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import path from 'path';

import { analyzer } from 'vite-bundle-analyzer';
import { defineConfig } from 'vite';
import type { Plugin } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

const TONCONNECT_MANIFEST_FILE = 'tonconnect-manifest.json';
const TONCONNECT_MANIFEST_ICON_FILE = 'web-app-manifest-512x512.png';
const DEFAULT_APP_ORIGIN = 'https://appkit-minter.vercel.app';

function normalizeOrigin(value: string | undefined): string | undefined {
    const host = value?.trim();

    if (!host) {
        return undefined;
    }

    const withProtocol = /^https?:\/\//.test(host) ? host : `https://${host}`;
    return new URL(withProtocol).origin;
}

function getVercelDeploymentOrigin(): string {
    if (process.env.VERCEL_ENV === 'production') {
        return (
            normalizeOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
            normalizeOrigin(process.env.VERCEL_URL) ??
            DEFAULT_APP_ORIGIN
        );
    }

    return (
        normalizeOrigin(process.env.VERCEL_URL) ??
        normalizeOrigin(process.env.VERCEL_BRANCH_URL) ??
        normalizeOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
        DEFAULT_APP_ORIGIN
    );
}

function getTonConnectManifestUrl(): string {
    return `${getVercelDeploymentOrigin()}/${TONCONNECT_MANIFEST_FILE}`;
}

function tonConnectManifestPlugin(): Plugin {
    return {
        name: 'appkit-minter-tonconnect-manifest',
        apply: 'build',
        generateBundle() {
            const origin = getVercelDeploymentOrigin();
            const manifest = {
                url: origin,
                name: 'AppKit Minter',
                iconUrl: `${origin}/${TONCONNECT_MANIFEST_ICON_FILE}`,
            };

            this.emitFile({
                type: 'asset',
                fileName: TONCONNECT_MANIFEST_FILE,
                source: `${JSON.stringify(manifest, null, 2)}\n`,
            });
        },
    };
}

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss(), tonConnectManifestPlugin(), process.env.ANALYZE === 'true' && analyzer()],
    define: {
        'import.meta.env.VITE_TONCONNECT_MANIFEST_URL': JSON.stringify(getTonConnectManifestUrl()),
    },
    server: {
        port: 5174,
        allowedHosts: ['localhost', '127.0.0.1', 'local.dev'],
        proxy: {
            '/getgems-api': {
                target: 'https://api.getgems.io',
                changeOrigin: true,
                rewrite: (p) => p.replace(/^\/getgems-api/, '/public-api'),
            },
        },
    },
    resolve: {
        alias: {
            '@/components': path.resolve(__dirname, './src/core/components'),
            '@/hooks': path.resolve(__dirname, './src/core/hooks'),
            '@/lib': path.resolve(__dirname, './src/core/lib'),
            '@': path.resolve(__dirname, './src'),
        },
    },
});
