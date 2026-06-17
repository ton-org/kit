/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect, useState } from 'react';
import type { FC } from 'react';

import { Modal } from '../../../../../components/ui/modal';
import { useI18n } from '../../../../settings/hooks/use-i18n';
import { Button } from '../../../../../components/ui/button';
import { Input } from '../../../../../components/ui/input';
import styles from './crypto-onramp-refund-address-modal.module.css';

export interface CryptoOnrampRefundAddressModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (address: string) => void;
    onSkip?: () => void;
    isLoading: boolean;
    error?: string | null;
}

export const CryptoOnrampRefundAddressModal: FC<CryptoOnrampRefundAddressModalProps> = ({
    open,
    onClose,
    onConfirm,
    onSkip,
    error,
    isLoading,
}) => {
    const { t } = useI18n();
    const [address, setAddress] = useState('');

    useEffect(() => {
        if (open) setAddress('');
    }, [open]);

    return (
        <Modal
            open={open}
            onOpenChange={(isOpen) => !isOpen && onClose()}
            title={t('cryptoOnramp.refundAddressModalTitle')}
        >
            <div className={styles.content}>
                <p className={styles.label}>{t('cryptoOnramp.refundAddressLabel')}</p>

                <Input.Container size="s" error={!!error}>
                    <Input.Field>
                        <Input.Input
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder={t('cryptoOnramp.refundAddressPlaceholder')}
                            autoFocus
                        />
                    </Input.Field>
                    {error && <Input.Caption>{error}</Input.Caption>}
                </Input.Container>

                <div className={styles.buttons}>
                    {onSkip && (
                        <Button variant="secondary" size="l" fullWidth onClick={onSkip} disabled={isLoading}>
                            {t('cryptoOnramp.skipRefundAddress')}
                        </Button>
                    )}

                    <Button
                        variant="fill"
                        size="l"
                        fullWidth
                        onClick={() => onConfirm(address.trim())}
                        disabled={!address.trim() || isLoading}
                    >
                        {t('cryptoOnramp.continue')}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
