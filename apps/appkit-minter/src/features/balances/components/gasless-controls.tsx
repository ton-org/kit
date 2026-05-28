/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useMemo } from 'react';
import type { FC } from 'react';
import { useSelectedWallet } from '@ton/appkit-react';
import { getErrorMessage } from '@ton/appkit';
import type { UserFriendlyAddress } from '@ton/appkit';

import { FeeAssetSelect } from './fee-asset-select';

interface GaslessControlsProps {
    enabled: boolean;
    onEnabledChange: (next: boolean) => void;
    feeAsset: UserFriendlyAddress | null;
    onFeeAssetChange: (next: UserFriendlyAddress) => void;
    fee: string | null;
    quoteError: unknown;
}

/**
 * Self-contained gasless UI block for the transfer modal: the enable toggle
 * (auto-disabled when the wallet lacks `SignMessage`), the fee-asset select,
 * the formatted fee preview and the quote error. Controlled by the caller —
 * gasless state lives in the modal so it can also gate the send button.
 */
export const GaslessControls: FC<GaslessControlsProps> = ({
    enabled,
    onEnabledChange,
    feeAsset,
    onFeeAssetChange,
    fee,
    quoteError,
}) => {
    const [selectedWallet] = useSelectedWallet();
    const supportsSignMessage = useMemo(() => {
        const features = selectedWallet?.getSupportedFeatures();
        if (features === undefined) return true;
        return features.some((feature) => typeof feature === 'object' && feature.name === 'SignMessage');
    }, [selectedWallet]);

    return (
        <div className="space-y-2">
            <label className="inline-flex items-center gap-2 text-sm text-foreground">
                <input
                    type="checkbox"
                    checked={enabled}
                    disabled={!supportsSignMessage}
                    onChange={(event) => onEnabledChange(event.target.checked)}
                />
                <span>Gasless — pay the gas fee in another token</span>
            </label>

            {!supportsSignMessage && (
                <p className="text-xs text-tertiary-foreground">
                    Connected wallet does not support gasless (no SignMessage feature).
                </p>
            )}

            {enabled && (
                <>
                    <FeeAssetSelect value={feeAsset} onChange={onFeeAssetChange} />
                    {!quoteError && (
                        <p className="px-1 text-xs text-tertiary-foreground">Gas fee: {fee || 'Loading...'}</p>
                    )}
                    {quoteError && <p className="text-xs text-error">{getErrorMessage(quoteError)}</p>}
                </>
            )}
        </div>
    );
};
