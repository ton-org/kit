/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { FC, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import {
    Button,
    Modal,
    useGaslessConfig,
    useGaslessProviderMetadata,
    useJettonInfo,
    useSelectedWallet,
} from '@ton/appkit-react';
import { asAddressFriendly, middleEllipsis } from '@ton/appkit';
import type { UserFriendlyAddress } from '@ton/appkit';

import { useMinterStore } from '../store/minter-store';
import { setGaslessFeeAsset } from '../store/actions/set-gasless-fee-asset';
import { useMintNft } from '../hooks/use-mint-nft';
import { CardPreview } from './card-preview';

interface MintConfirmModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const InfoRow: FC<{ label: string; value: ReactNode }> = ({ label, value }) => (
    <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-tertiary-foreground">{label}</span>
        <span className="text-foreground text-right">{value}</span>
    </div>
);

/**
 * Renders one fee-asset `<option>`; shows the address until `useJettonInfo`
 * resolves, then swaps to the ticker. React Query dedupes concurrent queries
 * by address — the selected option and its match in the dropdown share one fetch.
 */
const FeeAssetOption: FC<{ address: UserFriendlyAddress }> = ({ address }) => {
    const { data } = useJettonInfo({ address });
    return <option value={address}>{data?.symbol || middleEllipsis(address)}</option>;
};

/**
 * Confirms the mint. The regular flow shows only the Owner row; the gasless
 * flow adds Provider, an inline fee-asset selector styled to match the other
 * info-row values (right-aligned text + chevron, native `<select>` under the
 * hood — so the dropdown is rendered by the browser and never overflows the
 * modal), and the live commission. The Confirm button is gated on a fresh
 * quote in gasless mode.
 */
export const MintConfirmModal: FC<MintConfirmModalProps> = ({ open, onClose, onConfirm }) => {
    const [wallet] = useSelectedWallet();
    const currentCard = useMinterStore((state) => state.currentCard);
    const gaslessFeeAsset = useMinterStore((state) => state.gaslessFeeAsset);

    const mint = useMintNft();
    const { data: providerMetadata } = useGaslessProviderMetadata({
        query: { enabled: mint.gasless.enabled },
    });
    const { data: gaslessConfig } = useGaslessConfig({
        query: { enabled: mint.gasless.enabled },
    });
    const supportedAssets = gaslessConfig?.supportedAssets ?? [];

    const ownerAddress = wallet?.getAddress();
    const confirmDisabled =
        mint.isSending ||
        (mint.gasless.enabled && (mint.gasless.isLoadingQuote || !mint.gasless.quote || !!mint.gasless.quoteError));

    const feeText = mint.gasless.fee ?? (mint.gasless.isLoadingQuote ? 'Loading…' : '—');

    return (
        <Modal title="Confirm mint" open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            {currentCard && (
                <div className="mx-auto mb-4 w-40">
                    <CardPreview card={currentCard} />
                </div>
            )}

            <div className="space-y-3">
                <InfoRow label="Owner" value={ownerAddress ? middleEllipsis(ownerAddress) : '—'} />

                {mint.gasless.enabled && (
                    <>
                        <InfoRow label="Provider" value={providerMetadata?.name ?? 'TonAPI'} />

                        <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="text-tertiary-foreground">Fee asset</span>
                            <div className="relative inline-flex items-center">
                                <select
                                    value={gaslessFeeAsset ?? ''}
                                    onChange={(event) => setGaslessFeeAsset(asAddressFriendly(event.target.value))}
                                    disabled={supportedAssets.length === 0}
                                    className="appearance-none bg-transparent border-0 outline-none cursor-pointer text-foreground text-sm text-right pr-5 disabled:cursor-default disabled:text-tertiary-foreground"
                                >
                                    {!gaslessFeeAsset && (
                                        <option value="" disabled>
                                            Select
                                        </option>
                                    )}
                                    {supportedAssets.map((asset) => (
                                        <FeeAssetOption key={asset.address} address={asset.address} />
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-0 h-4 w-4 pointer-events-none text-tertiary-foreground" />
                            </div>
                        </div>

                        <InfoRow
                            label="Gas fee"
                            value={mint.gasless.quoteError ? <span className="text-error">Quote failed</span> : feeText}
                        />
                    </>
                )}
            </div>

            <Button
                className="mt-6 w-full"
                variant="fill"
                size="l"
                fullWidth
                onClick={onConfirm}
                disabled={confirmDisabled}
                loading={mint.isSending}
            >
                Confirm
            </Button>
        </Modal>
    );
};
