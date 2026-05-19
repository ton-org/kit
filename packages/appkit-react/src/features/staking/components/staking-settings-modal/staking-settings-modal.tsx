/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect, useMemo, useState } from 'react';
import type { FC } from 'react';
import type { Network, StakingProvider } from '@ton/appkit';

import type { StakingProvidersMetadata } from '../staking-widget-provider/use-staking-providers-with-metadata';
import { Modal } from '../../../../components/ui/modal/modal';
import { Button } from '../../../../components/ui/button';
import { OptionSwitcher } from '../../../../components/shared/option-switcher';
import { useI18n } from '../../../settings/hooks/use-i18n';
import styles from './staking-settings-modal.module.css';

export interface StakingSettingsModalProps {
    open: boolean;
    onClose: () => void;
    provider: StakingProvider | undefined;
    providers: StakingProvider[];
    providersMetadata?: StakingProvidersMetadata;
    isProvidersMetadataLoading?: boolean;
    onProviderChange: (providerId: string) => void;
    network?: Network;
}

export const StakingSettingsModal: FC<StakingSettingsModalProps> = ({
    open,
    onClose,
    provider,
    providers,
    providersMetadata,
    isProvidersMetadataLoading,
    onProviderChange,
}) => {
    const { t } = useI18n();

    const [stagedProviderId, setStagedProviderId] = useState<string | undefined>(provider?.providerId);

    useEffect(() => {
        if (open) setStagedProviderId(provider?.providerId);
    }, [open, provider?.providerId]);

    const providerOptions = useMemo(
        () =>
            providers.map((p) => ({
                value: p.providerId,
                label: providersMetadata?.[p.providerId]?.name ?? p.providerId,
            })),
        [providers, providersMetadata],
    );

    const handleSave = () => {
        if (stagedProviderId && stagedProviderId !== provider?.providerId) onProviderChange(stagedProviderId);
        onClose();
    };

    return (
        <Modal open={open} onOpenChange={(isOpen) => !isOpen && onClose()} title={t('staking.settings')}>
            <div className={styles.rows}>
                <div className={styles.row}>
                    <span className={styles.label}>{t('staking.provider')}</span>
                    <OptionSwitcher
                        value={stagedProviderId}
                        options={providerOptions}
                        onChange={setStagedProviderId}
                        loading={isProvidersMetadataLoading && !providersMetadata?.[stagedProviderId ?? '']}
                    />
                </div>
            </div>

            <Button className={styles.saveButton} variant="fill" size="l" fullWidth onClick={handleSave}>
                {t('staking.save')}
            </Button>
        </Modal>
    );
};
