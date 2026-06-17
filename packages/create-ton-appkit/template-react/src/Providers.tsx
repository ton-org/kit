// AppKit setup — https://docs.ton.org/applications/appkit/howto/appkit
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppKitProvider } from '@ton/appkit-react';
import '@ton/appkit-react/styles.css';
import type { ReactNode } from 'react';

import { appKit } from './appKit';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            staleTime: 30_000,
            retry: 1,
        },
    },
});

export function Providers({ children }: { children: ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <AppKitProvider appKit={appKit}>{children}</AppKitProvider>
        </QueryClientProvider>
    );
}
