/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { FC, ComponentProps } from 'react';
import clsx from 'clsx';

import styles from './onramp-token-selectors.module.css';
import { TokenSelector } from '../../../../components/shared/token-selector';
import { useI18n } from '../../../settings/hooks/use-i18n';

interface SlotProps {
    title: string;
    logoSrc?: string;
    networkLogoSrc?: string;
    /** When true, the pill outline stays but icon + title render as skeletons inside. */
    loading?: boolean;
    /** Text shown when `title` is empty — bypasses the `buyToken`/`forCurrency` symbol template. */
    placeholder?: string;
}

export interface OnrampTokenSelectorsProps extends ComponentProps<'div'> {
    from: SlotProps;
    to: SlotProps;
    onFromClick: () => void;
    onToClick: () => void;
}

export const OnrampTokenSelectors: FC<OnrampTokenSelectorsProps> = ({
    from,
    to,
    onFromClick,
    onToClick,
    className,
    ...props
}) => {
    const { t } = useI18n();

    return (
        <div className={clsx(styles.container, className)} {...props}>
            <TokenSelector
                size="m"
                variant="secondary"
                className={styles.tokenSelector}
                title={from.title ? t('onramp.buyToken', { symbol: from.title }) : (from.placeholder ?? '')}
                icon={from.logoSrc}
                hideIcon={!from.title}
                loading={from.loading}
                onClick={onFromClick}
            />

            <TokenSelector
                size="m"
                variant="secondary"
                className={styles.tokenSelector}
                title={to.title ? t('onramp.forCurrency', { symbol: to.title }) : (to.placeholder ?? '')}
                icon={to.logoSrc}
                networkIcon={to.networkLogoSrc}
                hideIcon={!to.title}
                loading={to.loading}
                onClick={onToClick}
            />
        </div>
    );
};
