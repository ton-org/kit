/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { FC } from 'react';
import clsx from 'clsx';

import styles from './token-selector.module.css';
import { Button } from '../../ui/button';
import type { ButtonProps } from '../../ui/button';
import { Logo } from '../../ui/logo';
import { LogoWithNetwork } from '../../ui/logo-with-network';
import { Skeleton } from '../../ui/skeleton';

interface TokenSelectorIconProps {
    title: string;
    icon?: string;
    iconFallback?: string;
    networkIcon?: string;
    empty?: boolean;
}

const TokenSelectorIcon: FC<TokenSelectorIconProps> = ({ title, icon, iconFallback, networkIcon, empty }) => {
    if (empty) {
        return <span className={styles.placeholderIcon} />;
    }

    const fallback = iconFallback || title[0];

    if (networkIcon) {
        return <LogoWithNetwork size={24} src={icon} fallback={fallback} alt={title} networkSrc={networkIcon} />;
    }

    return <Logo size={24} src={icon} fallback={fallback} alt={title} />;
};

export interface TokenSelectorProps extends ButtonProps {
    title: string;
    icon?: string;
    iconFallback?: string;
    /** When provided, renders a network badge overlay on the icon */
    networkIcon?: string;
    /** Hide chevron and suppress click handling — use when there's nothing to pick */
    readOnly?: boolean;
    /** No token picked yet — render a neutral placeholder circle instead of a logo or fallback letter. */
    empty?: boolean;
    /** Replace the icon and title with a single skeleton bar while the selection loads — pill outline stays. */
    loading?: boolean;
}

export const TokenSelector: FC<TokenSelectorProps> = ({
    title,
    icon,
    iconFallback,
    networkIcon,
    readOnly,
    empty,
    loading,
    onClick,
    className,
    ...props
}) => {
    return (
        <Button
            className={clsx(styles.tokenSelector, readOnly && styles.readOnly, className)}
            variant="gray"
            size="s"
            onClick={readOnly || loading ? undefined : onClick}
            {...props}
        >
            {loading ? (
                <Skeleton height={24} className={styles.titleSkeleton} />
            ) : (
                <>
                    <TokenSelectorIcon
                        title={title}
                        icon={icon}
                        iconFallback={iconFallback}
                        networkIcon={networkIcon}
                        empty={empty}
                    />

                    <span className={styles.symbol}>{title}</span>
                </>
            )}

            {!readOnly && (
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" className={styles.chevron}>
                    <path
                        d="M1 1.5L6 6.5L11 1.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            )}
        </Button>
    );
};
