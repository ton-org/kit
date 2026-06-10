/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { FC, ComponentProps } from 'react';
import clsx from 'clsx';

import type { InputContainerProps } from '../../ui/input';
import { Input } from '../../ui/input';
import type { ModalProps } from '../../ui/modal';
import { Modal } from '../../ui/modal';
import { SearchIcon } from '../../ui/icons';
import { useI18n } from '../../../features/settings/hooks/use-i18n';
import styles from './currency-select-modal.module.css';

export interface CurrencySelectSearchProps extends Omit<InputContainerProps, 'children'> {
    searchValue: string;
    onSearchChange: (value: string) => void;
    placeholder?: string;
}

export const CurrencySelectSearch: FC<CurrencySelectSearchProps> = ({
    searchValue,
    onSearchChange,
    placeholder,
    className,
    ...props
}) => {
    return (
        <Input.Container size="s" className={clsx(styles.searchWrapper, className)} {...props}>
            <Input.Field>
                <Input.Slot>
                    <SearchIcon size={24} />
                </Input.Slot>

                <Input.Input
                    placeholder={placeholder}
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    autoFocus
                />
            </Input.Field>
        </Input.Container>
    );
};

/**
 * Why the list has nothing to render. Texts are uniform across all currency modals
 * (swap, onramp tokens, onramp methods) by design — callers pass the state, not copy.
 */
export type CurrencySelectEmptyState = 'loading' | 'unavailable' | 'no-match';

export interface CurrencySelectListContainerProps extends ComponentProps<'div'> {
    /** When set, an empty-state message replaces `children`. */
    emptyState?: CurrencySelectEmptyState | null;
}

export const CurrencySelectListContainer: FC<CurrencySelectListContainerProps> = ({
    emptyState,
    children,
    className,
    ...props
}) => {
    const { t } = useI18n();

    return (
        <div className={clsx(styles.list, className)} {...props}>
            {emptyState ? (
                <div className={styles.empty}>
                    {emptyState === 'loading' && <p className={styles.emptyText}>{t('tokenSelect.loading')}</p>}
                    {emptyState === 'unavailable' && (
                        <>
                            <p className={styles.emptyText}>{t('tokenSelect.emptyUnavailable')}</p>
                            <p className={styles.emptyText}>{t('tokenSelect.emptyTryLater')}</p>
                        </>
                    )}
                    {emptyState === 'no-match' && (
                        <>
                            <p className={styles.emptyText}>{t('tokenSelect.emptyNoMatch')}</p>
                            <p className={styles.emptyText}>{t('tokenSelect.emptyTryAddress')}</p>
                        </>
                    )}
                </div>
            ) : (
                children
            )}
        </div>
    );
};

export interface CurrencySelectFilterOption {
    id: string;
    label: string;
    logo?: string;
}

export interface CurrencySelectFiltersProps {
    options: CurrencySelectFilterOption[];
    /** Currently active filter id. `null` means the implicit "All" chip is selected. */
    value: string | null;
    onChange: (id: string | null) => void;
    /** Label for the leading "All" chip — passed in so callers control i18n. */
    allLabel: string;
    className?: string;
}

export const CurrencySelectFilters: FC<CurrencySelectFiltersProps> = ({
    options,
    value,
    onChange,
    allLabel,
    className,
}) => {
    return (
        <div className={clsx(styles.filters, className)} role="tablist">
            <button
                type="button"
                role="tab"
                aria-selected={value === null}
                data-active={value === null ? '' : undefined}
                className={styles.chip}
                onClick={() => onChange(null)}
            >
                {allLabel}
            </button>
            {options.map((opt) => (
                <button
                    type="button"
                    role="tab"
                    aria-selected={value === opt.id}
                    data-active={value === opt.id ? '' : undefined}
                    className={styles.chip}
                    key={opt.id}
                    onClick={() => onChange(opt.id)}
                >
                    {opt.logo && <img src={opt.logo} alt="" className={styles.chipLogo} />}
                    <span>{opt.label}</span>
                </button>
            ))}
        </div>
    );
};

export const CurrencySelectSectionHeader: FC<ComponentProps<'p'>> = ({ className, children, ...props }) => (
    <p className={clsx(styles.sectionHeader, className)} {...props}>
        {children}
    </p>
);

export const CurrencySelectSection: FC<ComponentProps<'div'>> = ({ className, children, ...props }) => (
    <div className={clsx(styles.section, className)} {...props}>
        {children}
    </div>
);

export const CurrencySelectModal: FC<ModalProps> = ({ className, ...props }) => {
    return <Modal className={clsx(styles.body, className)} {...props} />;
};

export const CurrencySelect = {
    Modal: CurrencySelectModal,
    Search: CurrencySelectSearch,
    Filters: CurrencySelectFilters,
    ListContainer: CurrencySelectListContainer,
    SectionHeader: CurrencySelectSectionHeader,
    Section: CurrencySelectSection,
};
