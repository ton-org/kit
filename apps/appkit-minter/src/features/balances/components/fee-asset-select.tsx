/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect, useMemo } from 'react';
import type { FC } from 'react';
import { Input, useGaslessConfig, useJettonInfo } from '@ton/appkit-react';
import { asAddressFriendly, compareAddress, middleEllipsis } from '@ton/appkit';
import type { UserFriendlyAddress } from '@ton/appkit';

import { USDT_MASTER_MAINNET } from '../../../core/constants/tokens';

/**
 * Renders one fee-asset `<option>`; shows the token's address until its jetton
 * info loads, then the ticker. Each instance owns its own `useJettonInfo` query
 * so labels resolve independently — React Query dedupes identical addresses.
 */
const FeeAssetOption: FC<{ address: UserFriendlyAddress }> = ({ address }) => {
    const { data } = useJettonInfo({ address });
    return <option value={address}>{data?.symbol || middleEllipsis(address)}</option>;
};

interface FeeAssetSelectProps {
    value: UserFriendlyAddress | null;
    onChange: (address: UserFriendlyAddress) => void;
    disabled?: boolean;
}

/**
 * Fee-asset picker for gasless transfers. Lists the relayer-accepted assets and
 * preselects USDT (or the first asset) once they load. The native `<select>` is
 * wrapped in `Input.Container size="s"` so the field background/border/focus
 * state match the modal's other inputs.
 */
export const FeeAssetSelect: FC<FeeAssetSelectProps> = ({ value, onChange, disabled }) => {
    const { data: config, isLoading } = useGaslessConfig();
    const supportedAssets = useMemo(
        () => config?.supportedAssets && [...config.supportedAssets].sort((a, b) => a.address.localeCompare(b.address)),
        [config?.supportedAssets],
    );

    useEffect(() => {
        if (!value && supportedAssets?.length) {
            const preferred = supportedAssets.find((asset) => compareAddress(asset.address, USDT_MASTER_MAINNET));
            onChange(preferred?.address ?? supportedAssets[0].address);
        }
    }, [value, supportedAssets, onChange]);

    const isDisabled = disabled || isLoading || !supportedAssets?.length;

    return (
        <Input size="s" disabled={isDisabled}>
            <Input.Header>
                <Input.Title>Fee asset</Input.Title>
            </Input.Header>
            <Input.Field>
                <select
                    className="flex-1 min-w-0 w-full bg-transparent border-none outline-none text-foreground p-0 cursor-pointer"
                    style={{
                        // Match `Input size="s"` typography exactly — Tailwind's
                        // text-sm (14px) differs from the design token (16px).
                        fontFamily: 'var(--ta-font-family)',
                        fontSize: 'var(--ta-input-s-size)',
                        fontWeight: 'var(--ta-input-s-weight)',
                        lineHeight: 'var(--ta-input-s-line-height)',
                    }}
                    value={value ?? ''}
                    onChange={(event) => onChange(asAddressFriendly(event.target.value))}
                    disabled={isDisabled}
                >
                    {!value && (
                        <option value="" disabled>
                            Select fee asset
                        </option>
                    )}
                    {supportedAssets?.map((asset) => (
                        <FeeAssetOption key={asset.address} address={asset.address} />
                    ))}
                </select>
            </Input.Field>
        </Input>
    );
};
