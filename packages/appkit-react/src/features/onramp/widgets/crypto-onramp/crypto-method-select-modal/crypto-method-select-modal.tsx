/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useMemo, useState } from 'react';
import type { FC } from 'react';
import type { CryptoOnrampSourceCurrency } from '@ton/appkit';

import { CurrencySelect } from '../../../../../components/shared/currency-select-modal';
import type { CurrencySelectFilterOption } from '../../../../../components/shared/currency-select-modal';
import { LogoWithNetwork } from '../../../../../components/ui/logo-with-network';
import { CurrencyItem } from '../../../../../components/shared/currency-item';
import { useI18n } from '../../../../settings/hooks/use-i18n';
import type { ChainInfo } from '../utils/chains';
import { getChainInfo } from '../utils/chains';

export interface CryptoMethodSelectModalProps {
    open: boolean;
    onClose: () => void;
    methods: CryptoOnrampSourceCurrency[];
    /** CAIP-2 → display info map. Defaults to `{}` (helper falls back to the chain reference). */
    chains?: Record<string, ChainInfo>;
    onSelect: (method: CryptoOnrampSourceCurrency) => void;
}

const filterMethods = (
    methods: CryptoOnrampSourceCurrency[],
    search: string,
    chains: Record<string, ChainInfo>,
): CryptoOnrampSourceCurrency[] => {
    const q = search.toLowerCase();
    return methods.filter(
        (m) =>
            m.symbol.toLowerCase().includes(q) ||
            (m.name?.toLowerCase().includes(q) ?? false) ||
            getChainInfo(m.chain, chains).name.toLowerCase().includes(q),
    );
};

const methodKey = (m: CryptoOnrampSourceCurrency): string => `${m.chain}:${m.address.toLowerCase()}`;

export const CryptoMethodSelectModal: FC<CryptoMethodSelectModalProps> = ({
    open,
    onClose,
    methods,
    chains = {},
    onSelect,
}) => {
    const { t } = useI18n();
    const [search, setSearch] = useState('');
    const [chainFilter, setChainFilter] = useState<string | null>(null);

    const chainFilterOptions = useMemo<CurrencySelectFilterOption[]>(() => {
        const seen = new Set<string>();
        const result: CurrencySelectFilterOption[] = [];
        for (const m of methods) {
            if (seen.has(m.chain)) continue;
            seen.add(m.chain);
            const info = getChainInfo(m.chain, chains);
            result.push({ id: m.chain, label: info.name, logo: info.logo });
        }
        return result;
    }, [methods, chains]);

    const displayMethods = useMemo(() => {
        const byChain = chainFilter ? methods.filter((m) => m.chain === chainFilter) : methods;
        return search ? filterMethods(byChain, search, chains) : byChain;
    }, [methods, chains, search, chainFilter]);

    const isEmpty = displayMethods.length === 0;

    const handleSelect = (method: CryptoOnrampSourceCurrency) => () => {
        onSelect(method);
        onClose();
        setSearch('');
        setChainFilter(null);
    };

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            onClose();
            setSearch('');
            setChainFilter(null);
        }
    };

    return (
        <CurrencySelect.Modal open={open} onOpenChange={handleOpenChange} title={t('cryptoOnramp.method')}>
            <CurrencySelect.Search
                searchValue={search}
                onSearchChange={setSearch}
                placeholder={t('cryptoOnramp.searchMethod')}
            />

            {chainFilterOptions.length > 1 && (
                <CurrencySelect.Filters
                    options={chainFilterOptions}
                    value={chainFilter}
                    onChange={setChainFilter}
                    allLabel={t('cryptoOnramp.allNetworks')}
                />
            )}

            <CurrencySelect.ListContainer isEmpty={isEmpty}>
                <CurrencySelect.Section>
                    {displayMethods.map((method) => {
                        const chainInfo = getChainInfo(method.chain, chains);
                        const displayName = method.name ?? method.symbol;
                        return (
                            <CurrencyItem.Container key={methodKey(method)} onClick={handleSelect(method)}>
                                <LogoWithNetwork
                                    size={40}
                                    src={method.logo}
                                    alt={method.symbol}
                                    fallback={method.symbol[0]}
                                    networkSrc={chainInfo.logo}
                                    networkAlt={chainInfo.name[0]}
                                />
                                <CurrencyItem.Info>
                                    <CurrencyItem.Header>
                                        <CurrencyItem.Name>{displayName}</CurrencyItem.Name>
                                    </CurrencyItem.Header>
                                    <CurrencyItem.Ticker>
                                        {method.symbol} • {chainInfo.name}
                                    </CurrencyItem.Ticker>
                                </CurrencyItem.Info>
                            </CurrencyItem.Container>
                        );
                    })}
                </CurrencySelect.Section>
            </CurrencySelect.ListContainer>
        </CurrencySelect.Modal>
    );
};
