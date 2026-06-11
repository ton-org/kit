/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { TransactionRow } from '../transaction-row';
import { useTransactionRows } from '../../hooks/use-transaction-rows';

const PREVIEW_COUNT = 6;
// Load a few extra so the preview still fills 6 rows after action-less events are skipped.
const PREVIEW_LOAD = 10;

/**
 * Dashboard "History" block: the latest transactions. Like NftsCard, renders nothing
 * while loading or when empty; the header navigates to the full history page.
 */
export const TransactionHistory: React.FC = () => {
    const navigate = useNavigate();
    const { rows } = useTransactionRows(PREVIEW_LOAD);
    const preview = rows.slice(0, PREVIEW_COUNT);

    if (preview.length === 0) {
        return null;
    }

    return (
        <section>
            <button
                type="button"
                onClick={() => navigate('/wallet/history')}
                className="mb-2 flex items-center gap-1"
                aria-label="View all transactions"
            >
                <h2 className="text-base font-semibold text-gray-900">History</h2>
                <ChevronRight className="h-4 w-4 text-gray-400" />
            </button>

            <div className="space-y-1">
                {preview.map((row) => (
                    <TransactionRow key={row.id} {...row} />
                ))}
            </div>
        </section>
    );
};
