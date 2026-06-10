/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { FC } from 'react';
import type {
    JettonInfo,
    Network,
    StakingProviderInfo,
    StakingProviderMetadata,
    StakingQuote,
    StakingQuoteDirection,
    StakingTokenInfo,
} from '@ton/appkit';

import { Modal } from '../../../../components/ui/modal/modal';
import { Button } from '../../../../components/ui/button';
import { AmountPreview } from '../../../../components/shared/amount-preview';
import { FlowPreview } from '../../../../components/shared/flow-preview';
import type { AppkitUIToken } from '../../../../types/appkit-ui-token';
import { useJettonInfo } from '../../../jettons';
import { useI18n } from '../../../settings/hooks/use-i18n';
import { StakingInfo } from '../staking-info';
import styles from './staking-confirm-modal.module.css';

export interface StakingConfirmModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    direction: StakingQuoteDirection;
    network: Network | undefined;
    quote: StakingQuote | undefined;
    providerInfo: StakingProviderInfo | undefined;
    providerMetadata: StakingProviderMetadata | undefined;
    isProviderInfoLoading: boolean;
    isQuoteLoading: boolean;
}

/**
 * Adapter from staking-domain token shape (`StakingTokenInfo`) to the shared
 * `AppkitUIToken` shape consumed by AmountPreview/FlowPreview. `name` is taken
 * from the resolved jetton metadata when available, falling back to ticker.
 */
const toUIToken = (
    token: StakingTokenInfo | undefined,
    jettonInfo: JettonInfo | null | undefined,
    network: Network | undefined,
): AppkitUIToken | undefined => {
    if (!token || !network) return undefined;
    return {
        id: `${network.chainId}:${token.address}`,
        symbol: token.ticker,
        name: jettonInfo?.name ?? token.ticker,
        decimals: token.decimals,
        address: token.address,
        logo: token.address === 'ton' ? undefined : jettonInfo?.image,
        network,
    };
};

export const StakingConfirmModal: FC<StakingConfirmModalProps> = ({
    open,
    onClose,
    onConfirm,
    direction,
    network,
    quote,
    providerInfo,
    providerMetadata,
    isProviderInfoLoading,
    isQuoteLoading,
}) => {
    const { t } = useI18n();

    const stakeAddress = providerMetadata?.stakeToken.address;
    const receiveAddress = providerMetadata?.receiveToken?.address;

    const { data: stakeJettonInfo } = useJettonInfo({
        address: stakeAddress,
        query: { enabled: !!stakeAddress && stakeAddress !== 'ton' },
    });
    const { data: receiveJettonInfo } = useJettonInfo({
        address: receiveAddress,
        query: { enabled: !!receiveAddress && receiveAddress !== 'ton' },
    });

    const stakeToken = toUIToken(providerMetadata?.stakeToken, stakeJettonInfo, network);
    const receiveToken = toUIToken(providerMetadata?.receiveToken, receiveJettonInfo, network);

    const title = direction === 'stake' ? t('staking.confirmStakingTitle') : t('staking.confirmUnstakingTitle');

    const amountIn = quote?.amountIn ?? '0';
    const amountOut = quote?.amountOut ?? '0';

    return (
        <Modal open={open} onOpenChange={(isOpen) => !isOpen && onClose()} title={title}>
            {direction === 'stake' ? (
                <AmountPreview className={styles.singleAmount} amount={amountIn} token={stakeToken} />
            ) : (
                <FlowPreview fromAmount={amountIn} toAmount={amountOut} fromToken={receiveToken} toToken={stakeToken} />
            )}

            <StakingInfo
                className={styles.info}
                quote={quote}
                isQuoteLoading={isQuoteLoading}
                providerInfo={providerInfo}
                providerMetadata={providerMetadata}
                isProviderInfoLoading={isProviderInfoLoading}
                direction={direction}
            />

            <Button className={styles.confirmButton} variant="fill" size="l" fullWidth onClick={onConfirm}>
                {t('staking.confirm')}
            </Button>
        </Modal>
    );
};
