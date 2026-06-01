/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect, useMemo, useState } from 'react';
import type { FC } from 'react';
import { Button, Modal, Switch, useGaslessConfig, useNetwork, useSelectedWallet } from '@ton/appkit-react';
import { compareAddress, Network } from '@ton/appkit';
import type { UserFriendlyAddress } from '@ton/appkit';

import { useMinterStore } from '../store/minter-store';
import { setGaslessEnabled } from '../store/actions/set-gasless-enabled';
import { setGaslessFeeAsset } from '../store/actions/set-gasless-fee-asset';
import { USDT_MASTER_MAINNET } from '../../../core/constants/tokens';

interface MintSettingsModalProps {
    open: boolean;
    onClose: () => void;
}

/**
 * Gasless toggle for the mint flow. The fee-asset selection itself lives in
 * `MintConfirmModal` — this dialog only flips the on/off bit. On enabling we
 * pre-seed `gaslessFeeAsset` (USDT preferred, falling back to the first
 * relayer-supported asset) so the confirm modal always has a valid default.
 *
 * Disabled when the wallet lacks `SignMessage` or the active network isn't
 * mainnet — the supporting hint surfaces the exact reason.
 */
export const MintSettingsModal: FC<MintSettingsModalProps> = ({ open, onClose }) => {
    const gaslessEnabled = useMinterStore((state) => state.gaslessEnabled);
    const gaslessFeeAsset = useMinterStore((state) => state.gaslessFeeAsset);

    const [wallet] = useSelectedWallet();
    const network = useNetwork();
    const { data: gaslessConfig } = useGaslessConfig();

    const supportsSignMessage = useMemo(() => {
        const features = wallet?.getSupportedFeatures();
        if (features === undefined) return true;
        return features.some((feature) => typeof feature === 'object' && feature.name === 'SignMessage');
    }, [wallet]);

    const isMainnet = network?.chainId === Network.mainnet().chainId;
    const canEnableGasless = supportsSignMessage && isMainnet;

    const [stagedEnabled, setStagedEnabled] = useState(gaslessEnabled);

    // Reset staged value to the live one whenever the modal opens — drops any
    // unsaved tweaks from a previously dismissed session.
    useEffect(() => {
        if (open) setStagedEnabled(gaslessEnabled);
    }, [open, gaslessEnabled]);

    const handleSave = () => {
        if (stagedEnabled !== gaslessEnabled) {
            setGaslessEnabled(stagedEnabled);

            // Auto-seed fee-asset on first enable so the confirm modal renders
            // with a valid selection. Pick USDT when the relayer accepts it,
            // otherwise fall back to the first listed asset.
            if (stagedEnabled && !gaslessFeeAsset && gaslessConfig?.supportedAssets?.length) {
                const preferred = gaslessConfig.supportedAssets.find((asset) =>
                    compareAddress(asset.address, USDT_MASTER_MAINNET),
                );
                const seed: UserFriendlyAddress = preferred?.address ?? gaslessConfig.supportedAssets[0].address;
                setGaslessFeeAsset(seed);
            }
        }
        onClose();
    };

    const hint = !supportsSignMessage
        ? 'Connected wallet does not support gasless (no SignMessage feature).'
        : !isMainnet
          ? 'Gasless is available on mainnet only.'
          : null;

    return (
        <Modal title="Mint settings" open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-base text-foreground">Gasless</div>
                        <div className="text-xs text-tertiary-foreground">Pay the fee in a jetton instead of TON.</div>
                    </div>
                    <Switch checked={stagedEnabled} onCheckedChange={setStagedEnabled} disabled={!canEnableGasless} />
                </div>

                {hint && <p className="text-xs text-tertiary-foreground">{hint}</p>}
            </div>

            <Button className="mt-6 w-full" variant="fill" size="l" fullWidth onClick={handleSave}>
                Save
            </Button>
        </Modal>
    );
};
