/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect, useMemo, useState } from 'react';
import type { FC } from 'react';
import type { CryptoOnrampProvider } from '@ton/appkit';

import { Modal } from '../../../../../components/ui/modal/modal';
import { Button } from '../../../../../components/ui/button';
import { OptionSwitcher } from '../../../../../components/shared/option-switcher';
import { useI18n } from '../../../../settings/hooks/use-i18n';
import styles from './crypto-onramp-settings-modal.module.css';

export interface CryptoOnrampSettingsModalProps {
    open: boolean;
    onClose: () => void;
    provider: CryptoOnrampProvider | undefined;
    providers: CryptoOnrampProvider[];
    onProviderChange: (providerId: string) => void;
}

export const CryptoOnrampSettingsModal: FC<CryptoOnrampSettingsModalProps> = ({
    open,
    onClose,
    provider,
    providers,
    onProviderChange,
}) => {
    const { t } = useI18n();

    const [stagedProviderId, setStagedProviderId] = useState<string | undefined>(provider?.providerId);

    useEffect(() => {
        if (open) setStagedProviderId(provider?.providerId);
    }, [open, provider?.providerId]);

    const providerOptions = useMemo(
        () => providers.map((p) => ({ value: p.providerId, label: p.getMetadata().name })),
        [providers],
    );

    const handleSave = () => {
        if (stagedProviderId && stagedProviderId !== provider?.providerId) onProviderChange(stagedProviderId);
        onClose();
    };

    return (
        <Modal open={open} onOpenChange={(isOpen) => !isOpen && onClose()} title={t('cryptoOnramp.settings')}>
            <div className={styles.rows}>
                <div className={styles.row}>
                    <span className={styles.label}>{t('cryptoOnramp.provider')}</span>
                    <OptionSwitcher value={stagedProviderId} options={providerOptions} onChange={setStagedProviderId} />
                </div>
            </div>

            <Button className={styles.saveButton} variant="fill" size="l" fullWidth onClick={handleSave}>
                {t('cryptoOnramp.save')}
            </Button>
        </Modal>
    );
};
