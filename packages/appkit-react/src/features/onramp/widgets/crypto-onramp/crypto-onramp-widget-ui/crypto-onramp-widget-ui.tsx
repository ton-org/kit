/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ComponentProps, FC } from 'react';
import clsx from 'clsx';

import { ButtonWithConnect } from '../../../../../components/shared/button-with-connect';
import { OnrampTokenSelectors } from '../../../components/onramp-token-selectors';
import { CenteredAmountInput } from '../../../../../components/ui/centered-amount-input';
import { AmountPresets } from '../../../../../components/shared/amount-presets';
import { TokenSelectModal } from '../../../../../components/shared/token-select-modal';
import { AmountReversed } from '../../../../../components/ui/amount-reversed';
import { SettingsButton } from '../../../../../components/shared/settings-button';
import { CryptoMethodSelectModal } from '../crypto-method-select-modal';
import { CryptoOnrampDepositModal } from '../crypto-onramp-deposit-modal';
import { CryptoOnrampRefundAddressModal } from '../crypto-onramp-refund-address-modal';
import { CryptoOnrampSettingsModal } from '../crypto-onramp-settings-modal';
import { InfoBlock } from '../../../../../components/ui/info-block';
import type { CryptoOnrampContextType } from '../crypto-onramp-widget-provider';
import { getChainInfo } from '../utils/chains';
import { formatOnrampAmount } from '../utils/format-onramp-amount';
import { useI18n } from '../../../../settings/hooks/use-i18n';
import styles from './crypto-onramp-widget-ui.module.css';

export type CryptoOnrampWidgetRenderProps = CryptoOnrampContextType &
    Omit<ComponentProps<'div'>, keyof CryptoOnrampContextType>;

export const CryptoOnrampWidgetUI: FC<CryptoOnrampWidgetRenderProps> = ({
    tokens,
    selectedToken,
    setSelectedToken,
    paymentMethods,
    selectedMethod,
    setSelectedMethod,
    chains,
    amount,
    setAmount,
    amountInputMode,
    setAmountInputMode,
    convertedAmount,
    presetAmounts,
    provider,
    providers,
    setProviderId,
    quote,
    isLoadingQuote,
    createDeposit,
    isCreatingDeposit,
    deposit,
    depositAmount,
    isWalletConnected,
    canContinue,
    onReset,
    depositStatus,
    refundAddressMode,
    isReversedAmountSupported,
    quoteError,
    depositError,
    targetBalance,
    isLoadingTargetBalance,
    className,
    ...props
}) => {
    const [isTokenSelectOpen, setIsTokenSelectOpen] = useState(false);
    const [isMethodSelectOpen, setIsMethodSelectOpen] = useState(false);
    const [isRefundAddressOpen, setIsRefundAddressOpen] = useState(false);
    const [isDepositOpen, setIsDepositOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const { t } = useI18n();

    // TokenSelectModal generic requires `id` + non-optional `name`; supplement with
    // address-derived id and a name fallback so walletkit currencies satisfy the shared type.
    const tokensForSelect = useMemo(
        () => tokens.map((c) => ({ ...c, id: c.address, name: c.name ?? c.symbol })),
        [tokens],
    );

    const handleContinue = useCallback(() => {
        if (refundAddressMode === 'off') {
            createDeposit();
            return;
        }
        setIsRefundAddressOpen(true);
    }, [refundAddressMode, createDeposit]);

    const handleConfirmRefundAddress = useCallback(
        (address: string) => {
            createDeposit(address);
        },
        [createDeposit],
    );

    const handleSkipRefundAddress = useCallback(() => {
        createDeposit();
    }, [createDeposit]);

    const handleDepositClose = useCallback(() => {
        setIsDepositOpen(false);
        onReset();
    }, [onReset]);

    const handleRefundAddressClose = useCallback(() => {
        setIsRefundAddressOpen(false);
        onReset();
    }, [onReset]);

    useEffect(() => {
        if (deposit) {
            setIsDepositOpen(true);
            setIsRefundAddressOpen(false);
        }
    }, [deposit]);

    return (
        <div className={clsx(styles.widget, className)} {...props}>
            <OnrampTokenSelectors
                className={styles.selectors}
                from={{ title: selectedToken?.symbol ?? '', logoSrc: selectedToken?.logo }}
                to={{
                    title: selectedMethod?.symbol ?? '',
                    logoSrc: selectedMethod?.logo,
                    networkLogoSrc: selectedMethod ? getChainInfo(selectedMethod.chain, chains).logo : undefined,
                }}
                onFromClick={() => setIsTokenSelectOpen(true)}
                onToClick={() => setIsMethodSelectOpen(true)}
            />

            <div className={styles.inputSection}>
                <CenteredAmountInput
                    className={styles.input}
                    value={amount}
                    onValueChange={setAmount}
                    disabled={!isWalletConnected}
                    ticker={amountInputMode === 'token' ? selectedToken?.symbol : selectedMethod?.symbol}
                />

                <AmountReversed
                    className={styles.converted}
                    value={convertedAmount}
                    onChangeDirection={
                        isReversedAmountSupported
                            ? () => setAmountInputMode(amountInputMode === 'token' ? 'method' : 'token')
                            : undefined
                    }
                    ticker={amountInputMode === 'token' ? selectedMethod?.symbol : selectedToken?.symbol}
                    decimals={
                        amountInputMode === 'token' ? (selectedMethod?.decimals ?? 0) : (selectedToken?.decimals ?? 0)
                    }
                />
            </div>

            <AmountPresets className={styles.presets} presets={presetAmounts} onPresetSelect={setAmount} />

            <div className={styles.actions}>
                <ButtonWithConnect
                    variant="fill"
                    size="l"
                    disabled={!canContinue || isCreatingDeposit}
                    loading={isCreatingDeposit}
                    onClick={handleContinue}
                    fullWidth
                >
                    {quoteError ? t(quoteError) : t('cryptoOnramp.continue')}
                </ButtonWithConnect>
                <SettingsButton onClick={() => setIsSettingsOpen(true)} />
            </div>

            <InfoBlock.Container className={styles.info}>
                <InfoBlock.Row>
                    <InfoBlock.Label>{t('cryptoOnramp.youGet')}</InfoBlock.Label>

                    {isLoadingQuote ? (
                        <InfoBlock.ValueSkeleton />
                    ) : (
                        <InfoBlock.Value>
                            {formatOnrampAmount(
                                amountInputMode === 'token' ? amount : convertedAmount,
                                selectedToken?.decimals,
                            )}{' '}
                            {selectedToken?.symbol}
                        </InfoBlock.Value>
                    )}
                </InfoBlock.Row>

                {/*<InfoBlock.Row>
                    <InfoBlock.Label>{t('cryptoOnramp.exchangeRate')}</InfoBlock.Label>

                    {isLoadingQuote ? (
                        <InfoBlock.ValueSkeleton />
                    ) : (
                        <InfoBlock.Value>
                            1 {selectedToken?.symbol} ={' '}
                            {formatOnrampAmount(quote ? (1 / parseFloat(quote.rate)).toString() : '0', 2)}{' '}
                            {selectedMethod.symbol}
                        </InfoBlock.Value>
                    )}
                </InfoBlock.Row>*/}

                {isWalletConnected && (
                    <InfoBlock.Row>
                        <InfoBlock.Label>{t('cryptoOnramp.yourBalance')}</InfoBlock.Label>

                        {isLoadingTargetBalance ? (
                            <InfoBlock.ValueSkeleton />
                        ) : (
                            <InfoBlock.Value>
                                {formatOnrampAmount(targetBalance || '0', selectedToken?.decimals)}{' '}
                                {selectedToken?.symbol}
                            </InfoBlock.Value>
                        )}
                    </InfoBlock.Row>
                )}

                <InfoBlock.Row>
                    <InfoBlock.Label>{t('cryptoOnramp.provider')}</InfoBlock.Label>
                    <InfoBlock.Value>{provider?.getMetadata().name ?? ''}</InfoBlock.Value>
                </InfoBlock.Row>
            </InfoBlock.Container>

            <TokenSelectModal
                open={isTokenSelectOpen}
                onClose={() => setIsTokenSelectOpen(false)}
                tokens={tokensForSelect}
                onSelect={setSelectedToken}
                title={t('onramp.selectToken')}
                searchPlaceholder={t('onramp.searchToken')}
            />

            <CryptoMethodSelectModal
                open={isMethodSelectOpen}
                onClose={() => setIsMethodSelectOpen(false)}
                methods={paymentMethods}
                chains={chains}
                onSelect={setSelectedMethod}
            />

            <CryptoOnrampDepositModal
                open={isDepositOpen}
                onClose={handleDepositClose}
                address={deposit?.address ?? ''}
                amount={depositAmount}
                symbol={selectedMethod?.symbol ?? ''}
                memo={deposit?.memo}
                tokenLogo={selectedMethod?.logo}
                chainWarning={deposit?.chainWarning}
                depositStatus={depositStatus}
                targetSymbol={selectedToken?.symbol ?? ''}
                targetBalance={targetBalance}
                targetDecimals={selectedToken?.decimals}
                isLoadingTargetBalance={isLoadingTargetBalance}
            />

            <CryptoOnrampRefundAddressModal
                open={isRefundAddressOpen}
                onClose={handleRefundAddressClose}
                onConfirm={handleConfirmRefundAddress}
                onSkip={refundAddressMode === 'optional' ? handleSkipRefundAddress : undefined}
                isLoading={isCreatingDeposit}
                error={depositError ? t(depositError) : null}
            />

            <CryptoOnrampSettingsModal
                open={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                provider={provider}
                providers={providers}
                onProviderChange={setProviderId}
            />
        </div>
    );
};
