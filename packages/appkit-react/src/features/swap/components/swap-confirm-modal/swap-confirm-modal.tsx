/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { FC } from 'react';
import type { SwapProvider, SwapQuote } from '@ton/appkit';

import { Modal } from '../../../../components/ui/modal/modal';
import { Button } from '../../../../components/ui/button';
import { FlowPreview } from '../../../../components/shared/flow-preview';
import { useI18n } from '../../../settings/hooks/use-i18n';
import type { AppkitUIToken } from '../../../../types/appkit-ui-token';
import { SwapInfo } from '../swap-info';
import styles from './swap-confirm-modal.module.css';

export interface SwapConfirmModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    fromToken: AppkitUIToken | null;
    toToken: AppkitUIToken | null;
    fromAmount: string;
    toAmount: string;
    fiatSymbol: string;
    quote?: SwapQuote;
    swapProvider?: SwapProvider;
    slippage: number;
    isQuoteLoading?: boolean;
}

export const SwapConfirmModal: FC<SwapConfirmModalProps> = ({
    open,
    onClose,
    onConfirm,
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    fiatSymbol,
    quote,
    swapProvider,
    slippage,
    isQuoteLoading,
}) => {
    const { t } = useI18n();

    return (
        <Modal open={open} onOpenChange={(isOpen) => !isOpen && onClose()} title={t('swap.confirmTitle')}>
            <FlowPreview
                fromAmount={fromAmount}
                toAmount={toAmount}
                fromToken={fromToken ?? undefined}
                toToken={toToken ?? undefined}
                fiatSymbol={fiatSymbol}
            />

            <SwapInfo
                className={styles.info}
                quote={quote}
                provider={swapProvider}
                toToken={toToken}
                slippage={slippage}
                isQuoteLoading={isQuoteLoading}
            />

            <Button className={styles.confirmButton} variant="fill" size="l" fullWidth onClick={onConfirm}>
                {t('swap.confirm')}
            </Button>
        </Modal>
    );
};
