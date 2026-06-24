/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useWalletStore } from '@demo/wallet-core';
import { Base64ToHex } from '@ton/walletkit';
import type { Event } from '@ton/walletkit';

import { mapEventToRow, mapPendingToRow } from '../utils/map-transaction-row';
import type { TransactionRowModel } from '../utils/map-transaction-row';

const nowSeconds = (): number => Math.floor(Date.now() / 1000);

interface TransactionRows {
    rows: TransactionRowModel[];
    hasMore: boolean;
}

/**
 * Loads the latest events (first `limit`, newest first), merges pending transactions
 * and maps everything to rows. Shared by the dashboard preview and the full history page.
 */
export const useTransactionRows = (limit: number): TransactionRows => {
    const { events, loadEvents, address, pendingTransactions, network, hasMore } = useWalletStore(
        useShallow((state) => {
            const activeWallet = state.walletManagement.savedWallets.find(
                (w) => w.id === state.walletManagement.activeWalletId,
            );
            return {
                events: state.walletManagement.events,
                loadEvents: state.loadEvents,
                address: state.walletManagement.address,
                pendingTransactions: state.walletManagement.pendingTransactions,
                network: activeWallet?.network ?? 'testnet',
                hasMore: state.walletManagement.hasNextEvents,
            };
        }),
    );

    useEffect(() => {
        if (!address) return;
        void loadEvents(limit, 0);
    }, [address, loadEvents, limit]);

    const rows = useMemo<TransactionRowModel[]>(() => {
        const eventItems = (events ?? []) as Event[];
        const myAddress = address ?? '';

        // Drop pending entries already confirmed by a loaded event.
        const confirmedTraceIds = new Set<string>();
        const confirmedExternalHashes = new Set<string>();
        for (const ev of eventItems) {
            if (ev.eventId) confirmedTraceIds.add(String(ev.eventId));
            if (ev.traceExternalHash) confirmedExternalHashes.add(Base64ToHex(ev.traceExternalHash));
        }

        const seen = new Set<string>();
        const pendingRows = pendingTransactions
            .filter((p) => {
                if (p.traceId && confirmedTraceIds.has(p.traceId)) return false;
                if (p.externalHash && confirmedExternalHashes.has(p.externalHash)) return false;
                if (seen.has(p.traceId)) return false;
                seen.add(p.traceId);
                return true;
            })
            .map((p) => {
                const timestamp = p.preview?.timestamp ?? nowSeconds();
                return { timestamp, row: mapPendingToRow(p, myAddress, timestamp, network) };
            });

        const eventRows = eventItems
            .map((ev) => ({ timestamp: ev.timestamp, row: mapEventToRow(ev, myAddress, network) }))
            .filter((item): item is { timestamp: number; row: TransactionRowModel } => item.row !== null);

        return [...pendingRows, ...eventRows].sort((a, b) => b.timestamp - a.timestamp).map((item) => item.row);
    }, [events, pendingTransactions, address, network]);

    return { rows, hasMore };
};
