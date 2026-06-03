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

import { useMinterStore } from '../store/minter-store';
import { enableGasless } from '../store/actions/enable-gasless';
import { setGaslessEnabled } from '../store/actions/set-gasless-enabled';
import { getMintForwardAddress } from '../constants';
import { useCanEnableGasless } from '../hooks/use-can-enable-gasless';

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
 * Disabled when the wallet lacks `SignMessage` or the active network has no
 * deployed mint-forwarder — the supporting hint surfaces the exact reason.
 */
export const MintSettingsModal: FC<MintSettingsModalProps> = ({ open, onClose }) => {
    const gaslessEnabled = useMinterStore((state) => state.gaslessEnabled);

    const [wallet] = useSelectedWallet();
    const network = useNetwork();
    const { data: gaslessConfig } = useGaslessConfig();
    const canEnableGasless = useCanEnableGasless();

    const supportsSignMessage = useMemo(() => {
        const features = wallet?.getSupportedFeatures();
        if (features === undefined) return true;
        return features.some((feature) => typeof feature === 'object' && feature.name === 'SignMessage');
    }, [wallet]);

    const isNetworkSupported = network ? !!getMintForwardAddress(network.chainId) : false;

    const [stagedEnabled, setStagedEnabled] = useState(gaslessEnabled);

    // Reset staged value to the live one whenever the modal opens — drops any
    // unsaved tweaks from a previously dismissed session.
    useEffect(() => {
        if (open) setStagedEnabled(gaslessEnabled);
    }, [open, gaslessEnabled]);

    const handleSave = () => {
        if (stagedEnabled !== gaslessEnabled) {
            if (stagedEnabled) {
                enableGasless({ supportedAssets: gaslessConfig?.supportedAssets });
            } else {
                setGaslessEnabled(false);
            }
        }
        onClose();
    };

    const hint = !supportsSignMessage
        ? 'Connected wallet does not support gasless (no SignMessage feature).'
        : !isNetworkSupported
          ? 'Gasless is not available on this network.'
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
