/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { FC, ComponentProps } from 'react';
import { calcFiatValue } from '@ton/appkit';
import clsx from 'clsx';

import { ChevronDownIcon } from '../../ui/icons';
import { AmountPreview } from '../amount-preview';
import type { AppkitUIToken } from '../../../types/appkit-ui-token';
import styles from './flow-preview.module.css';

export interface FlowPreviewProps extends ComponentProps<'div'> {
    fromAmount: string;
    toAmount: string;
    fromToken?: AppkitUIToken;
    toToken?: AppkitUIToken;
    fiatSymbol?: string;
}

/**
 * Returns the relative fiat delta between paying `fromFiat` and receiving `toFiat`,
 * or `undefined` when either side lacks fiat data.
 */
const calcFiatDelta = (fromFiat: string, toFiat: string): number | undefined => {
    const from = parseFloat(fromFiat);
    const to = parseFloat(toFiat);
    if (!from || !to) return undefined;
    return (to - from) / from;
};

export const FlowPreview: FC<FlowPreviewProps> = ({
    fromAmount,
    toAmount,
    fromToken,
    toToken,
    fiatSymbol = '$',
    className,
    ...props
}) => {
    const fromFiat = calcFiatValue(fromAmount || '0', fromToken?.rate);
    const toFiat = calcFiatValue(toAmount || '0', toToken?.rate);
    const fiatDelta = calcFiatDelta(fromFiat, toFiat);

    return (
        <div className={clsx(styles.container, className)} {...props}>
            <AmountPreview amount={fromAmount} token={fromToken} fiatSymbol={fiatSymbol} />

            <div className={styles.separator}>
                <span className={styles.separatorLine} />
                <span className={styles.arrowBadge}>
                    <ChevronDownIcon size={16} />
                </span>
            </div>

            <AmountPreview amount={toAmount} token={toToken} fiatSymbol={fiatSymbol} fiatDelta={fiatDelta} />
        </div>
    );
};
