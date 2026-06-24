/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import type { DAppInfo } from '@ton/walletkit';

import { DappRequestHeader } from '../dapp-request-header';

import { Button } from '@/core/components/ui/button';
import { Modal } from '@/core/components/ui/modal';

/** Resolve the blue "{dApp}?" label: domain → URL host → name → fallback. */
const dappLabel = (dAppInfo?: DAppInfo, domain?: string): string => {
    if (domain) return domain;
    if (dAppInfo?.url) {
        try {
            return new URL(dAppInfo.url).host;
        } catch {
            return dAppInfo.url;
        }
    }
    return dAppInfo?.name ?? 'this dApp';
};

interface DappRequestModalProps {
    isOpen: boolean;
    dAppInfo?: DAppInfo;
    domain?: string;
    verb: string;
    subtitle: string;
    /** The wallet plate (and, for connect, its inline picker). */
    walletSlot: React.ReactNode;
    /** Request-specific content (permissions / data-to-sign / tx details). */
    children: React.ReactNode;
    /** Primary action node (a Button or HoldToSignButton). */
    primary: React.ReactNode;
    onReject: () => void;
    rejectDisabled?: boolean;
    rejectTestId?: string;
    disclaimer: React.ReactNode;
    /** Distinguishes the request type for tests (e.g. "connect-request"). */
    testId?: string;
    /** When set, replaces the request content with this in-modal view (e.g. the wallet picker),
     *  reusing the same overlay so switching doesn't flicker. */
    altView?: React.ReactNode;
}

/**
 * Shared shell for every TON Connect request (connect / sign-data / transaction / sign-message):
 * a non-dismissible modal with a scrollable body and a pinned footer (primary + reject + disclaimer).
 */
export const DappRequestModal: React.FC<DappRequestModalProps> = ({
    isOpen,
    dAppInfo,
    domain,
    verb,
    subtitle,
    walletSlot,
    children,
    primary,
    onReject,
    rejectDisabled,
    rejectTestId,
    disclaimer,
    testId,
    altView,
}) => (
    <Modal.Container
        isOpened={isOpen}
        onOpenChange={() => {}}
        dismissible={false}
        className="flex max-h-[88vh] flex-col overflow-hidden"
        data-testid={testId}
    >
        {altView ?? (
            <>
                <div className="flex-1 overflow-y-auto px-5 pt-6">
                    <DappRequestHeader
                        verb={verb}
                        label={dappLabel(dAppInfo, domain)}
                        subtitle={subtitle}
                        dAppIconUrl={dAppInfo?.iconUrl}
                    />

                    <div className="mt-6 space-y-3 pb-2">
                        {walletSlot}
                        {children}
                        <p className="px-2 pt-1 text-center text-xs text-gray-500">{disclaimer}</p>
                    </div>
                </div>

                <div className="shrink-0 space-y-2 px-5 pb-6 pt-3">
                    {primary}
                    <Button
                        variant="secondary"
                        fullWidth
                        onClick={onReject}
                        disabled={rejectDisabled}
                        data-testid={rejectTestId}
                    >
                        Reject
                    </Button>
                </div>
            </>
        )}
    </Modal.Container>
);
