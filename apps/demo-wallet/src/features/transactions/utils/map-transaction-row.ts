/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Base64ToHex } from '@ton/walletkit';
import type { Action, Event } from '@ton/walletkit';

import { formatLargeValue, formatUnits, getTonviewerTxUrl, sameAddress } from '@/core/utils';

/** Network accepted by the explorer-url builder (mainnet/testnet/tetra). */
type ExplorerNetwork = Parameters<typeof getTonviewerTxUrl>[0];

/** Status badge shown on the transaction icon. */
export type TransactionRowStatus = 'success' | 'loading' | 'failed';

/** Normalized view-model consumed by {@link TransactionRow}. */
export interface TransactionRowModel {
    /** Unique React key. */
    id: string;
    /** Tonviewer transaction URL. Undefined for not-yet-on-chain pending transactions (row is not clickable). */
    explorerUrl?: string;
    /** Primary label, e.g. "Sent 5 GRAM" / "Received 1 USDT". */
    title: string;
    /** Truncated trace id shown as the subtitle. */
    subtitleId: string;
    /** Signed crypto amount, e.g. "+5 GRAM" / "-1 USDT". */
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

const GRAM_DECIMALS = 9;
/** Cap on fractional digits shown for amounts (matches the appkit widget formatter). */
const AMOUNT_DECIMALS = 4;

/** Raw amount (nanoton / jetton base units) -> compact human string, e.g. "1M" / "1,234.5". */
const formatAmount = (raw: bigint | string, decimals: number): string =>
    formatLargeValue(formatUnits(raw, decimals), AMOUNT_DECIMALS);

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

/** Title + bare value (no sign) for an action, derived from the typed amount fields. */
const describeAction = (action: Action, isOutgoing: boolean): { title: string; value: string } => {
    const label = isOutgoing ? 'Sent' : 'Received';

    if (action.type === 'TonTransfer' && 'TonTransfer' in action) {
        const value = `${formatAmount(action.TonTransfer.amount, GRAM_DECIMALS)} GRAM`;
        return { title: `${label} ${value}`, value };
    }
    if (action.type === 'JettonTransfer' && 'JettonTransfer' in action) {
        const { amount, jetton } = action.JettonTransfer;
        const value = `${formatAmount(amount, jetton.decimals)} ${jetton.symbol}`.trim();
        return { title: `${label} ${value}`, value };
    }
    // Other action types (swap, nft, contract): fall back to the API preview text.
    return { title: action.simplePreview.description, value: action.simplePreview.value };
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
export const mapEventToRow = (
    event: Event,
    myAddress: string,
    network: ExplorerNetwork,
): TransactionRowModel | null => {
    if (!event.actions || event.actions.length === 0) return null;
    const action = selectRelevantAction(event.actions, myAddress);
    const isOutgoing = isOutgoingFromAction(action, myAddress);
    const { title, value } = describeAction(action, isOutgoing);
    const eventId = String(event.eventId);
    const hash = event.traceExternalHash ? Base64ToHex(event.traceExternalHash) : eventId;
    return {
        id: eventId,
        explorerUrl: getTonviewerTxUrl(network, hash),
        title,
        subtitleId: truncateMiddle(eventId),
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
export const mapPendingToRow = (
    pending: PendingLike,
    myAddress: string,
    timestamp: number,
    network: ExplorerNetwork,
): TransactionRowModel => {
    const status = pendingStatus(pending);
    // Not-yet-on-chain (still loading) transactions have no explorer page yet.
    const explorerUrl =
        status === 'loading' ? undefined : getTonviewerTxUrl(network, pending.externalHash ?? pending.traceId);
    const base = {
        id: `pending-${pending.traceId}`,
        explorerUrl,
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
    const value = pending.preview ? `${formatAmount(pending.preview.amount, GRAM_DECIMALS)} GRAM` : '';
    const title = pending.preview ? `${isOutgoing ? 'Sent' : 'Received'} ${value}` : 'Processing';
    return { ...base, title, amount: signedAmount(value, isOutgoing), isOutgoing };
};
