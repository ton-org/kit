/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { FC } from 'react';
import { Button } from '@ton/appkit-react';

import { TransactionStatus } from '@/features/transaction';

interface TransferReceiptProps {
    boc: string;
    onClose: () => void;
}

/**
 * Post-submit view in the transfer modal: tracks the transaction status by BoC
 * and offers a Close button.
 */
export const TransferReceipt: FC<TransferReceiptProps> = ({ boc, onClose }) => (
    <div className="space-y-6">
        <TransactionStatus boc={boc} />
        <Button fullWidth onClick={onClose}>
            Close
        </Button>
    </div>
);
