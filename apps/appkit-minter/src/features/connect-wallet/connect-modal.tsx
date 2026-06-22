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
import { Copy, X } from 'lucide-react';
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

/** Grey sublabels under featured tiles, mirroring the stock TON Connect modal. */
const FEATURED_SUBLABELS: Record<string, string | undefined> = { tonkeeper: 'Popular' };

/** The stock modal special-cases the Telegram wallet's display name. */
const WALLET_DISPLAY_NAMES: Record<string, string> = { 'telegram-wallet': 'Wallet in Telegram' };

/** "What is TON Connect?" target behind the footer help button. */
const TON_CONNECT_HELP_URL = 'https://docs.ton.org/develop/dapps/ton-connect/overview';

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

    const copyLink = () => {
        const url = link ?? getDemoLink();
        if (url) {
            void navigator.clipboard?.writeText(url);
        }
    };

    const openHelp = () => {
        window.open(TON_CONNECT_HELP_URL, '_blank', 'noopener,noreferrer');
    };

    return (
        <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <Dialog.Content
                        aria-describedby={undefined}
                        onOpenAutoFocus={(e) => e.preventDefault()}
                        className="w-[416px] max-w-full overflow-hidden rounded-[24px] bg-[#121214] text-white shadow-2xl"
                    >
                        <div className="relative px-[56px] pb-8 pt-11 text-center">
                            <Dialog.Title className="text-[20px] font-semibold leading-7">
                                Connect your TON wallet
                            </Dialog.Title>
                            <p className="mt-1 text-base leading-[22px] text-[#8b8b8e]">Scan with your mobile wallet</p>
                            <Dialog.Close
                                aria-label="Close"
                                className="absolute right-5 top-5 flex size-8 items-center justify-center rounded-full bg-[#2a2a2d] text-[#8b8b8e] transition-colors hover:text-white"
                            >
                                <X size={18} />
                            </Dialog.Close>
                        </div>

                        <div className="relative mx-[56px] flex justify-center rounded-2xl bg-white py-6">
                            {link ? (
                                <QRCodeSVG
                                    value={link}
                                    size={256}
                                    level="M"
                                    bgColor="#FFFFFF"
                                    fgColor="#000000"
                                    imageSettings={{ src: '/ton.png', height: 60, width: 60, excavate: true }}
                                />
                            ) : (
                                <div className="size-[256px]" />
                            )}
                            <button
                                type="button"
                                onClick={copyLink}
                                aria-label="Copy link"
                                className="absolute bottom-3 right-3 text-[#9a9ca3] transition-colors hover:text-[#4a4a4e]"
                            >
                                <Copy size={20} />
                            </button>
                        </div>

                        <p className="mb-3 mt-5 text-center text-base text-[#8b8b8e]">Available wallets</p>
                        <div className="grid grid-cols-4 px-[56px] pb-5">
                            <WalletTile
                                name={DEMO_WALLET_NAME}
                                sublabel="Recent"
                                iconUrl={DEMO_WALLET_ICON_URL}
                                onClick={openDemoWallet}
                            />
                            {featured.map((w) => (
                                <WalletTile
                                    key={w.appName}
                                    name={WALLET_DISPLAY_NAMES[w.appName] ?? w.name}
                                    sublabel={FEATURED_SUBLABELS[w.appName]}
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

                        <div className="flex items-center justify-between border-t border-white/[0.08] px-6 py-3">
                            <span className="flex items-center gap-2 text-[15px] font-semibold">
                                <img src="/ton.png" alt="" className="size-5 rounded-full" />
                                <span>
                                    <span className="text-white">TON</span>{' '}
                                    <span className="text-white/60">Connect</span>
                                </span>
                            </span>
                            <button
                                type="button"
                                onClick={openHelp}
                                aria-label="What is TON Connect?"
                                className="flex size-9 items-center justify-center rounded-full bg-white/[0.06] text-base text-[#8b8b8e] transition-colors hover:text-white"
                            >
                                ?
                            </button>
                        </div>
                    </Dialog.Content>
                </Dialog.Overlay>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
