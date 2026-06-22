/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect, useState } from 'react';
import type { FC } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { QRCodeSVG } from 'qrcode.react';
import { X } from 'lucide-react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import type { WalletInfo } from '@tonconnect/ui-react';

import { WalletTile } from './wallet-tile';
import { ViewAllIcon } from './view-all-icon';
import { useDemoConnectLink } from './use-demo-connect-link';
import { clearConnectedViaDemoWallet, markConnectedViaDemoWallet } from './demo-wallet-session';
import { DEMO_WALLET_ICON_URL, DEMO_WALLET_NAME } from './constants';

interface ConnectModalProps {
    open: boolean;
    onClose: () => void;
}

/** Registry wallets featured next to the demo wallet, in display order. */
const FEATURED_APP_NAMES = ['telegram-wallet', 'tonkeeper'];

/**
 * A faithful re-creation of the TON Connect modal (header, QR, "Available
 * wallets" row, footer). The demo wallet is pinned first and connects in one
 * click — it opens its universal link in a new tab rather than going through
 * the stock modal's QR/redirect flow. Every other tile routes back into the
 * real TON Connect modal so the standard wallets keep working.
 */
export const ConnectModal: FC<ConnectModalProps> = ({ open, onClose }) => {
    const [tonConnectUI] = useTonConnectUI();
    const getDemoLink = useDemoConnectLink();
    const [link, setLink] = useState<string | null>(null);
    const [wallets, setWallets] = useState<WalletInfo[]>([]);

    // Build the demo connect link (for the QR + one-click tile) on each open.
    useEffect(() => {
        if (open) {
            setLink(getDemoLink());
        }
    }, [open, getDemoLink]);

    // Load the wallet registry once to mirror the stock modal's wallet row.
    useEffect(() => {
        let active = true;
        tonConnectUI
            .getWallets()
            .then((list) => active && setWallets(list))
            .catch(() => undefined);
        return () => {
            active = false;
        };
    }, [tonConnectUI]);

    const featured = FEATURED_APP_NAMES.map((name) => wallets.find((w) => w.appName === name)).filter(
        (w): w is WalletInfo => Boolean(w),
    );
    const gridIcons = [DEMO_WALLET_ICON_URL, ...wallets.map((w) => w.imageUrl)];

    const openDemoWallet = () => {
        const url = link ?? getDemoLink();
        if (url) {
            // Remember the choice so the mint flow knows to reopen the demo
            // wallet for approvals.
            markConnectedViaDemoWallet();
            window.open(url, '_blank', 'noopener,noreferrer');
        }
        onClose();
    };

    const openWallet = (appName: string) => {
        clearConnectedViaDemoWallet();
        onClose();
        void tonConnectUI.openSingleWalletModal(appName);
    };

    const openAll = () => {
        clearConnectedViaDemoWallet();
        onClose();
        void tonConnectUI.openModal();
    };

    return (
        <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <Dialog.Content
                        aria-describedby={undefined}
                        onOpenAutoFocus={(e) => e.preventDefault()}
                        className="w-[400px] max-w-full overflow-hidden rounded-[24px] bg-[#121214] text-white shadow-2xl"
                    >
                        <div className="relative px-6 pb-4 pt-6 text-center">
                            <Dialog.Title className="text-[20px] font-bold">Connect your TON wallet</Dialog.Title>
                            <p className="mt-1 text-sm text-[#8b8b8e]">Scan with your mobile wallet</p>
                            <Dialog.Close
                                aria-label="Close"
                                className="absolute right-5 top-5 flex size-8 items-center justify-center rounded-full bg-[#2a2a2d] text-[#8b8b8e] transition-colors hover:text-white"
                            >
                                <X size={18} />
                            </Dialog.Close>
                        </div>

                        <div className="mx-6 flex justify-center rounded-2xl bg-white p-5">
                            {link ? (
                                <QRCodeSVG
                                    value={link}
                                    size={224}
                                    level="M"
                                    bgColor="#FFFFFF"
                                    fgColor="#000000"
                                    imageSettings={{ src: '/ton.png', height: 44, width: 44, excavate: true }}
                                />
                            ) : (
                                <div className="size-[224px]" />
                            )}
                        </div>

                        <p className="mb-3 mt-5 text-center text-sm text-[#8b8b8e]">Available wallets</p>
                        <div className="flex justify-center gap-1 px-4 pb-5">
                            <WalletTile
                                name={DEMO_WALLET_NAME}
                                sublabel="Recent"
                                iconUrl={DEMO_WALLET_ICON_URL}
                                onClick={openDemoWallet}
                            />
                            {featured.map((w) => (
                                <WalletTile
                                    key={w.appName}
                                    name={w.name}
                                    iconUrl={w.imageUrl}
                                    onClick={() => openWallet(w.appName)}
                                />
                            ))}
                            <WalletTile
                                name="View all wallets"
                                icon={<ViewAllIcon iconUrls={gridIcons} />}
                                onClick={openAll}
                            />
                        </div>

                        <div className="flex items-center justify-between border-t border-white/[0.08] px-6 py-3 text-sm text-[#8b8b8e]">
                            <span className="flex items-center gap-2">
                                <img src="/ton.png" alt="" className="size-4 rounded-full" />
                                TON Connect
                            </span>
                        </div>
                    </Dialog.Content>
                </Dialog.Overlay>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
