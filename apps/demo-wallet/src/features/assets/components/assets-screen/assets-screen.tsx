/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';

import { AssetRow, AssetRowSkeleton } from '../asset-row';
import { useAssetRows } from '../../hooks/use-asset-rows';

import { NewLayout } from '@/core/components/shared/new-layout';
import { ScreenHeader } from '@/core/components/shared/screen-header';

/** Full assets page: every token on the active wallet's balance (TON + all jettons). */
export const AssetsScreen: FC = () => {
    const navigate = useNavigate();
    const { tonRow, jettonRows, assetsReady } = useAssetRows();

    return (
        <NewLayout header={<ScreenHeader title="Assets" onBack={() => navigate('/wallet')} />}>
            <div className="space-y-1">
                {assetsReady && tonRow ? (
                    <>
                        <AssetRow {...tonRow} />
                        {jettonRows.map((row) => (
                            <AssetRow key={row.id} {...row} />
                        ))}
                    </>
                ) : (
                    <>
                        <AssetRowSkeleton />
                        <AssetRowSkeleton />
                        <AssetRowSkeleton />
                    </>
                )}
            </div>
        </NewLayout>
    );
};
