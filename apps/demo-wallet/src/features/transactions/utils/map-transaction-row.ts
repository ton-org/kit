/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { Action, Event } from '@ton/walletkit';

import { formatTonForDisplay, sameAddress } from '@/core/utils';

/** Status badge shown on the transaction icon. */
export type TransactionRowStatus = 'success' | 'loading' | 'failed';

/** Normalized view-model consumed by {@link TransactionRow}. */
export interface TransactionRowModel {
    /** Unique React key. */
    id: string;
    /** Trace id used to navigate to the trace page. */
    traceId: string;
    /** Primary label, e.g. "Sent 5 TON" / "Received 1 USDT". */
    title: string;
    /** Truncated trace id shown as the subtitle. */
    subtitleId: string;
    /** Signed crypto amount, e.g. "+5 TON" / "-1 USDT". */
    amount: string;
    /** Outgoing transfers are red, incoming are green. */
    isOutgoing: boolean;
    status: TransactionRowStatus;
    /** Formatted date+time, e.g. "Sep 10, 14:30". */
    date: string;
}

/** Minimal shape of a streaming pending transaction (structural — avoids a cross-package type import). */
interface PendingLike {
    traceId: string;
    externalHash?: string;
    finality?: 'pending' | 'confirmed' | 'finalized' | 'invalidated';
    action?: Action;
    preview?: { type: 'send' | 'receive' | 'contract'; amount: string };
}

const TON_TRANSFER_DESC = /^Transferring (.+) TON$/;
const TON_VALUE = /^(.+) TON$/;
const JETTON_TRANSFER_DESC = /^Transferring (.+)$/;

const truncateMiddle = (value: string): string => {
    const v = String(value);
    return v.length > 12 ? `${v.slice(0, 6)}…${v.slice(-4)}` : v;
};

const formatTxDate = (timestampSeconds: number): string =>
    new Date(timestampSeconds * 1000).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });

const isOutgoingFromAction = (action: Action, myAddress: string): boolean => {
    if (action.type === 'TonTransfer' && 'TonTransfer' in action) {
        return sameAddress(action.TonTransfer?.sender?.address, myAddress);
    }
    if (action.type === 'JettonTransfer' && 'JettonTransfer' in action) {
        return sameAddress(action.JettonTransfer?.sender?.address, myAddress);
    }
    if (action.type === 'NftItemTransfer' && 'NftItemTransfer' in action) {
        return sameAddress(action.NftItemTransfer?.sender?.address, myAddress);
    }
    const accounts = action.simplePreview?.accounts;
    return accounts != null && accounts.length > 0 && sameAddress(accounts[0].address, myAddress);
};

/** Title + bare value (no sign) for an action, mirroring the existing ActionCard mapping. */
const describeAction = (action: Action, isOutgoing: boolean): { title: string; value: string } => {
    const { description, value } = action.simplePreview;
    const label = isOutgoing ? 'Sent' : 'Received';

    const descMatch = description?.match(TON_TRANSFER_DESC);
    const valueMatch = value?.match(TON_VALUE);
    if (descMatch && valueMatch && action.type === 'TonTransfer') {
        const amount = formatTonForDisplay(valueMatch[1]);
        return { title: `${label} ${amount} TON`, value: `${amount} TON` };
    }
    if (valueMatch && action.type === 'TonTransfer') {
        return { title: description, value: `${formatTonForDisplay(valueMatch[1])} TON` };
    }
    const jettonMatch = description?.match(JETTON_TRANSFER_DESC);
    if (jettonMatch && action.type === 'JettonTransfer') {
        return { title: `${label} ${jettonMatch[1]}`, value: value ?? '' };
    }
    return { title: description, value };
};

/** Picks the action that involves the current wallet, preferring the one where we are the sender. */
const selectRelevantAction = (actions: Action[], myAddress: string): Action => {
    const withMe = actions.filter((a) => a.simplePreview?.accounts?.some((acc) => sameAddress(acc.address, myAddress)));
    const isSender = (a: Action): boolean => isOutgoingFromAction(a, myAddress);
    return withMe.find(isSender) ?? withMe[0] ?? actions[0];
};

const signedAmount = (value: string, isOutgoing: boolean): string => (value ? `${isOutgoing ? '-' : '+'}${value}` : '');

/**
 * Maps a historical event to a row. Returns null for events without actions
 * (rendered elsewhere via the trace fetch — skipped in the dashboard preview).
 */
export const mapEventToRow = (event: Event, myAddress: string): TransactionRowModel | null => {
    if (!event.actions || event.actions.length === 0) return null;
    const action = selectRelevantAction(event.actions, myAddress);
    const isOutgoing = isOutgoingFromAction(action, myAddress);
    const { title, value } = describeAction(action, isOutgoing);
    const traceId = String(event.eventId);
    return {
        id: traceId,
        traceId,
        title,
        subtitleId: truncateMiddle(traceId),
        amount: signedAmount(value, isOutgoing),
        isOutgoing,
        status: action.status === 'failure' ? 'failed' : 'success',
        date: formatTxDate(event.timestamp),
    };
};

const pendingStatus = (pending: PendingLike): TransactionRowStatus => {
    if (pending.action?.status === 'failure' || pending.finality === 'invalidated') return 'failed';
    if (pending.finality === 'finalized') return 'success';
    return 'loading';
};

/** Maps a streaming pending transaction to a row (via its parsed action, falling back to the preview). */
export const mapPendingToRow = (pending: PendingLike, myAddress: string, timestamp: number): TransactionRowModel => {
    const status = pendingStatus(pending);
    const base = {
        id: `pending-${pending.traceId}`,
        traceId: pending.traceId,
        subtitleId: truncateMiddle(pending.traceId),
        status,
        date: formatTxDate(timestamp),
    };

    if (pending.action) {
        const isOutgoing = isOutgoingFromAction(pending.action, myAddress);
        const { title, value } = describeAction(pending.action, isOutgoing);
        return { ...base, title, amount: signedAmount(value, isOutgoing), isOutgoing };
    }

    const isOutgoing = pending.preview?.type === 'send';
    const amount = pending.preview ? `${formatTonForDisplay(pending.preview.amount)} TON` : '';
    const title = pending.preview ? `${isOutgoing ? 'Sent' : 'Received'} ${amount}` : 'Processing';
    return { ...base, title, amount: signedAmount(amount, isOutgoing), isOutgoing };
};
