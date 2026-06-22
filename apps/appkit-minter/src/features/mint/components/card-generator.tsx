/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useCallback, useEffect, useState } from 'react';
import type React from 'react';
import { AlertCircle, Coins, Sparkles } from 'lucide-react';
import { Button, ButtonWithConnect, LowBalanceModal, SettingsButton, useSelectedWallet } from '@ton/appkit-react';
import { getErrorMessage } from '@ton/appkit';

import { CardPreview } from './card-preview';
import { MintConfirmModal } from './mint-confirm-modal';
import { MintSettingsModal } from './mint-settings-modal';
import { useCardGenerator } from '../hooks/use-card-generator';
import { useMintNft } from '../hooks/use-mint-nft';
import type { MintShortfall } from '../hooks/use-mint-nft';
import { buildDemoWalletMintUrl } from '../lib/demo-wallet-mint';
import { enableGasless } from '../store/actions/enable-gasless';
import { mintCard } from '../store/actions/mint-card';
import { setMintError } from '../store/actions/set-mint-error';

import { isConnectedViaDemoWallet } from '@/features/connect-wallet';
import { cn } from '@/core/lib/utils';

const RARITY_ODDS: { label: string; chance: number; color: string }[] = [
    { label: 'Common', chance: 60, color: 'bg-tertiary-foreground' },
    { label: 'Rare', chance: 25, color: 'bg-blue-500' },
    { label: 'Epic', chance: 12, color: 'bg-purple-500' },
    { label: 'Legendary', chance: 3, color: 'bg-amber-500' },
];

interface CardGeneratorProps {
    className?: string;
}

export const CardGenerator: React.FC<CardGeneratorProps> = ({ className }) => {
    const { currentCard, isGenerating, generate } = useCardGenerator();
    const [wallet] = useSelectedWallet();
    const mint = useMintNft();

    const [mintErrorLocal, setMintErrorLocal] = useState<string | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [pendingShortfall, setPendingShortfall] = useState<MintShortfall | undefined>(undefined);

    // Wallet disconnect closes any open mint-flow modals so the user can't
    // confirm a quote whose `from` no longer matches the active wallet.
    useEffect(() => {
        if (!wallet) {
            setIsSettingsOpen(false);
            setIsConfirmOpen(false);
            setPendingShortfall(undefined);
        }
    }, [wallet]);

    const handleConfirm = useCallback(async () => {
        const shortfall = mint.checkShortfall();
        if (shortfall) {
            setIsConfirmOpen(false);
            setPendingShortfall(shortfall);
            return;
        }

        setIsConfirmOpen(false);

        // The demo wallet isn't running in the background like a mobile wallet,
        // so reopen it (synchronously, within the click gesture to dodge popup
        // blockers) to surface the approval. The link carries `ret` (return here
        // after signing) and `asset` (the NFT the wallet renders in its confirm
        // modal). Harmless no-op for real wallets, which receive the request
        // over the bridge on their own.
        if (isConnectedViaDemoWallet() && currentCard) {
            window.open(buildDemoWalletMintUrl(currentCard, mint.gasless.fee), '_blank', 'noopener,noreferrer');
        }

        try {
            await mint.send();
            mintCard();
            setMintErrorLocal(null);
            setMintError(null);
        } catch (error) {
            const msg = getErrorMessage(error);
            setMintErrorLocal(msg);
            setMintError(msg);
        }
    }, [mint, currentCard]);

    const handleSwitchToGasless = useCallback(() => {
        enableGasless();
        setPendingShortfall(undefined);
        setIsConfirmOpen(true);
    }, []);

    const dismissShortfall = useCallback(() => setPendingShortfall(undefined), []);

    return (
        <div className={cn('mx-auto flex w-full max-w-[434px] flex-col gap-4', className)}>
            <div className="flex justify-center rounded-2xl bg-secondary p-6">
                {currentCard ? (
                    <div className="w-56">
                        <CardPreview card={currentCard} />
                    </div>
                ) : (
                    <div className="w-56 rounded-2xl border-2 border-dashed border-tertiary bg-background/40 p-4">
                        <div className="mb-4 flex aspect-square items-center justify-center rounded-xl border border-tertiary/20 bg-background/50">
                            <Sparkles className="h-10 w-10 text-tertiary-foreground" />
                        </div>
                        <div className="h-14" />
                    </div>
                )}
            </div>

            <div className="grid grid-cols-4 gap-1 rounded-xl bg-secondary px-3 py-2 text-xs">
                {RARITY_ODDS.map(({ label, chance, color }) => (
                    <div key={label} className="flex items-center justify-center gap-1.5">
                        <span className={cn('h-2 w-2 rounded-full', color)} />
                        <span className="text-tertiary-foreground">{chance}%</span>
                    </div>
                ))}
            </div>

            {mintErrorLocal && (
                <div className="flex items-center gap-2 rounded-xl border border-error/30 bg-error/10 p-3">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 text-error" />
                    <p className="text-xs text-error">{mintErrorLocal}</p>
                </div>
            )}

            <div className="flex flex-col gap-2">
                <Button
                    size="l"
                    variant={currentCard ? 'bezeled' : 'fill'}
                    onClick={generate}
                    loading={isGenerating}
                    fullWidth
                    icon={<Sparkles className="h-4 w-4" />}
                >
                    {currentCard ? 'Generate new card' : 'Generate card'}
                </Button>

                {currentCard && (
                    <div className="flex gap-2">
                        <ButtonWithConnect
                            size="l"
                            variant="fill"
                            fullWidth
                            disabled={mint.isSending}
                            loading={mint.isSending}
                            onClick={() => setIsConfirmOpen(true)}
                            icon={<Coins className="h-4 w-4" />}
                        >
                            Mint NFT
                        </ButtonWithConnect>
                        <SettingsButton onClick={() => setIsSettingsOpen(true)} />
                    </div>
                )}
            </div>

            <MintSettingsModal open={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
            <MintConfirmModal open={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={handleConfirm} />

            {pendingShortfall && (
                <LowBalanceModal
                    open
                    mode={pendingShortfall.mode}
                    requiredTon={pendingShortfall.requiredTon}
                    onCancel={dismissShortfall}
                    onSwitchToGasless={handleSwitchToGasless}
                />
            )}
        </div>
    );
};
