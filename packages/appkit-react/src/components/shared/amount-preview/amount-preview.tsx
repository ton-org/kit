/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { FC, ComponentProps } from 'react';
import { calcFiatValue, formatLargeValue } from '@ton/appkit';
import clsx from 'clsx';

import { Logo } from '../../ui/logo';
import { GramIconCircle } from '../../ui/icons';
import type { AppkitUIToken } from '../../../types/appkit-ui-token';
import { getDisplayAmount } from '../../../features/swap/utils/get-display-amount';
import styles from './amount-preview.module.css';

export interface AmountPreviewProps extends ComponentProps<'div'> {
    /** Raw token amount to display (decimal string). */
    amount: string;
    /** Token whose logo and symbol are shown alongside the amount. */
    token?: AppkitUIToken;
    /** Fiat currency symbol, e.g. "$". */
    fiatSymbol?: string;
    /**
     * Relative fiat delta to render after the fiat value, e.g. -0.0025 → "(-0.25%)".
     * Typically computed by a parent that knows both legs of a flow.
     */
    fiatDelta?: number;
}

const formatFiatDelta = (delta: number): string => {
    const sign = delta > 0 ? '+' : '';
    return `(${sign}${(delta * 100).toFixed(2)}%)`;
};

export const AmountPreview: FC<AmountPreviewProps> = ({
    amount,
    token,
    fiatSymbol = '$',
    fiatDelta,
    className,
    ...props
}) => {
    const displayAmount = getDisplayAmount(amount, token?.decimals);
    const fiatValue = token?.rate ? formatLargeValue(calcFiatValue(amount || '0', token.rate), 2, 2) : null;

    return (
        <div className={clsx(styles.container, className)} {...props}>
            <div className={styles.amountRow}>
                <span className={styles.amount}>{displayAmount}</span>
                {token && (
                    <span className={styles.tokenTag}>
                        {token.address === 'ton' ? (
                            <GramIconCircle size={24} />
                        ) : (
                            <Logo size={24} src={token.logo} fallback={token.symbol?.[0] ?? '?'} alt={token.symbol} />
                        )}
                        <span className={styles.symbol}>{token.symbol}</span>
                    </span>
                )}
            </div>
            {fiatValue !== null && (
                <div className={styles.fiat}>
                    <span>
                        {fiatSymbol} {fiatValue}
                    </span>
                    {fiatDelta !== undefined && <span className={styles.fiatDelta}>{formatFiatDelta(fiatDelta)}</span>}
                </div>
            )}
        </div>
    );
};
