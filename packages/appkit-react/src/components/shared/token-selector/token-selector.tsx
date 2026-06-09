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

export interface TokenSelectorProps extends ButtonProps {
    title: string;
    icon?: string;
    iconFallback?: string;
    /** When provided, renders a network badge overlay on the icon */
    networkIcon?: string;
    /** Hide chevron and suppress click handling — use when there's nothing to pick */
    readOnly?: boolean;
    /** Skip the icon slot entirely (no logo, no fallback letter) — use for empty/placeholder states. */
    hideIcon?: boolean;
    /** Show skeletons for the icon and title inside the pill — pill outline stays. */
    loading?: boolean;
}

export const TokenSelector: FC<TokenSelectorProps> = ({
    title,
    icon,
    iconFallback,
    networkIcon,
    readOnly,
    hideIcon,
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
                <Skeleton width={24} height={24} className={styles.iconSkeleton} />
            ) : (
                !hideIcon &&
                (networkIcon ? (
                    <LogoWithNetwork
                        size={24}
                        src={icon}
                        fallback={iconFallback || title[0]}
                        alt={title}
                        networkSrc={networkIcon}
                    />
                ) : (
                    <Logo size={24} src={icon} fallback={iconFallback || title[0]} alt={title} />
                ))
            )}

            <span className={styles.symbol}>{loading ? <Skeleton width={80} height={16} /> : title}</span>

            {!readOnly && !loading && (
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
