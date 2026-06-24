/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { FC } from 'react';

import { Modal } from '../../ui/modal/modal';
import { Button } from '../../ui/button';
import { useI18n } from '../../../features/settings/hooks/use-i18n';
import styles from './low-balance-modal.module.css';

export type LowBalanceMode = 'reduce' | 'topup' | 'gasless';

const MESSAGE_KEY_BY_MODE: Record<LowBalanceMode, string> = {
    reduce: 'lowBalance.messageReduce',
    topup: 'lowBalance.messageTopup',
    gasless: 'lowBalance.messageGasless',
};

export interface LowBalanceModalProps {
    open: boolean;
    /**
     * `reduce`  — user can fix it by reducing the amount (shows Change/Cancel). Requires `onChange`.
     * `topup`   — reducing doesn't help, user must top up GRAM (shows Close only).
     * `gasless` — alternative path via gasless flow (shows Switch/Cancel). Requires `onSwitchToGasless`.
     */
    mode: LowBalanceMode;
    /** Required amount in GRAM, formatted as a decimal string (e.g. "0.423"). */
    requiredTon: string;
    onCancel: () => void;
    /** Primary action for `reduce` mode. */
    onChange?: () => void;
    /** Primary action for `gasless` mode. */
    onSwitchToGasless?: () => void;
}

export const LowBalanceModal: FC<LowBalanceModalProps> = ({
    open,
    mode,
    requiredTon,
    onCancel,
    onChange,
    onSwitchToGasless,
}) => {
    const { t } = useI18n();

    const messageKey = MESSAGE_KEY_BY_MODE[mode];

    return (
        <Modal open={open} onOpenChange={(isOpen) => !isOpen && onCancel()} title={t('lowBalance.title')}>
            <p className={styles.message}>{t(messageKey, { amount: requiredTon })}</p>

            <div className={styles.actions}>
                {mode === 'reduce' && (
                    <>
                        <Button variant="secondary" size="l" fullWidth onClick={onCancel}>
                            {t('lowBalance.cancel')}
                        </Button>
                        <Button variant="fill" size="l" fullWidth onClick={onChange}>
                            {t('lowBalance.change')}
                        </Button>
                    </>
                )}
                {mode === 'gasless' && (
                    <>
                        <Button variant="secondary" size="l" fullWidth onClick={onCancel}>
                            {t('lowBalance.cancel')}
                        </Button>
                        <Button variant="fill" size="l" fullWidth onClick={onSwitchToGasless}>
                            {t('lowBalance.switchToGasless')}
                        </Button>
                    </>
                )}
                {mode === 'topup' && (
                    <Button variant="fill" size="l" fullWidth onClick={onCancel}>
                        {t('lowBalance.close')}
                    </Button>
                )}
            </div>
        </Modal>
    );
};
