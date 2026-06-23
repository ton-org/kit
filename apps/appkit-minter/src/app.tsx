/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppKitProvider } from '@ton/appkit-react';

import { appKit } from '@/core/configs/app-kit';
import { AppRouter, ThemeProvider, ToasterProvider } from '@/core/components';
import { dismissBootSplash } from '@/core/lib/boot-splash';

import './core/styles/index.css';

const queryClient = new QueryClient();

export const App = () => {
    useEffect(dismissBootSplash, []);

    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <QueryClientProvider client={queryClient}>
                <AppKitProvider appKit={appKit}>
                    <AppRouter />
                    <ToasterProvider />
                </AppKitProvider>
            </QueryClientProvider>
        </ThemeProvider>
    );
};
