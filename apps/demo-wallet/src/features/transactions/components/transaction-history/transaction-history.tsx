/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useEffect, useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useWalletStore } from '@demo/wallet-core';
import { Base64ToHex } from '@ton/walletkit';
import type { Event } from '@ton/walletkit';

import { TransactionRow } from '../transaction-row';
import { mapEventToRow, mapPendingToRow } from '../../utils/map-transaction-row';
import type { TransactionRowModel } from '../../utils/map-transaction-row';

const MAX_ROWS = 6;
// Load a few extra so the preview still fills 6 rows after action-less events are skipped.
const LOAD_LIMIT = 10;

const nowSeconds = (): number => Math.floor(Date.now() / 1000);

/**
 * Dashboard "History" block: the latest transactions for the active wallet.
 * Mirrors the Assets/NFTs section header and, like NftsCard, renders nothing
 * while loading or when there is nothing to show.
 */
export const TransactionHistory: React.FC = () => {
    const { events, loadEvents, address, pendingTransactions } = useWalletStore(
        useShallow((state) => ({
            events: state.walletManagement.events,
            loadEvents: state.loadEvents,
            address: state.walletManagement.address,
            pendingTransactions: state.walletManagement.pendingTransactions,
        })),
    );

    useEffect(() => {
        if (!address) return;
        void loadEvents(LOAD_LIMIT, 0);
    }, [address, loadEvents]);

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
                return { timestamp, row: mapPendingToRow(p, myAddress, timestamp) };
            });

        const eventRows = eventItems
            .map((ev) => ({ timestamp: ev.timestamp, row: mapEventToRow(ev, myAddress) }))
            .filter((item): item is { timestamp: number; row: TransactionRowModel } => item.row !== null);

        return [...pendingRows, ...eventRows]
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, MAX_ROWS)
            .map((item) => item.row);
    }, [events, pendingTransactions, address]);

    // Like NftsCard: render nothing while loading or when empty.
    if (rows.length === 0) {
        return null;
    }

    return (
        <section>
            <header className="mb-2 flex items-center gap-1">
                <h2 className="text-base font-semibold text-gray-900">History</h2>
                <ChevronRight className="h-4 w-4 text-gray-400" />
            </header>

            <div className="space-y-1">
                {rows.map((row) => (
                    <TransactionRow key={row.id} {...row} />
                ))}
            </div>
        </section>
    );
};
