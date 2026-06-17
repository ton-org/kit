/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useState } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';

import { TransactionRow } from '../transaction-row';
import { useTransactionRows } from '../../hooks/use-transaction-rows';

import { Button } from '@/core/components/ui/button';
import { NewLayout } from '@/core/components/shared/new-layout';
import { ScreenHeader } from '@/core/components/shared/screen-header';

const PAGE_SIZE = 25;

/** Full transaction history page: all transactions with "load more" pagination. */
export const HistoryScreen: FC = () => {
    const navigate = useNavigate();
    const [limit, setLimit] = useState(PAGE_SIZE);
    const { rows, hasMore } = useTransactionRows(limit);

    return (
        <NewLayout header={<ScreenHeader title="History" onBack={() => navigate('/wallet')} />}>
            {rows.length === 0 ? (
                <p className="py-12 text-center text-sm text-gray-400">No transactions yet</p>
            ) : (
                <div className="space-y-1">
                    {rows.map((row) => (
                        <TransactionRow key={row.id} {...row} />
                    ))}
                </div>
            )}

            {hasMore && (
                <div className="mt-4 flex justify-center">
                    <Button variant="secondary" size="sm" onClick={() => setLimit((current) => current + PAGE_SIZE)}>
                        Load more
                    </Button>
                </div>
            )}
        </NewLayout>
    );
};
