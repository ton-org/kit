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
import { useConnect, useConnectors } from '../../../../wallets';
import { OnrampTokenSelectors } from '../../../components/onramp-token-selectors';
import { CenteredAmountInput } from '../../../../../components/ui/centered-amount-input';
import { AmountPresets } from '../../../../../components/shared/amount-presets';
import { Skeleton } from '../../../../../components/ui/skeleton';
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
    isLoadingSupportedCurrencies,
    chains,
    amount,
    setAmount,
    amountInputMode,
    setAmountInputMode,
    convertedAmount,
    presetAmounts,
    provider,
    providers,
    providersMetadata,
    isProvidersMetadataLoading,
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
    const [submittedRefundAddress, setSubmittedRefundAddress] = useState<string | undefined>(undefined);

    const { t } = useI18n();

    const connectors = useConnectors();
    const { mutate: connect } = useConnect();

    // TokenSelectModal generic requires `id` + non-optional `name`; supplement with
    // address-derived id and a name fallback so walletkit currencies satisfy the shared type.
    const tokensForSelect = useMemo(
        () => tokens.map((c) => ({ ...c, id: c.address, name: c.name ?? c.symbol })),
        [tokens],
    );

    const providerName = provider ? providersMetadata[provider.providerId]?.name : undefined;

    const handleConnect = useCallback(() => {
        if (connectors[0]) connect({ connectorId: connectors[0].id });
    }, [connectors, connect]);

    const handleContinue = useCallback(() => {
        if (refundAddressMode === 'off') {
            createDeposit();
            return;
        }
        setIsRefundAddressOpen(true);
    }, [refundAddressMode, createDeposit]);

    const handleConfirmRefundAddress = useCallback(
        (address: string) => {
            setSubmittedRefundAddress(address);
            createDeposit(address);
        },
        [createDeposit],
    );

    const handleSkipRefundAddress = useCallback(() => {
        setSubmittedRefundAddress(undefined);
        createDeposit();
    }, [createDeposit]);

    const handleDepositClose = useCallback(() => {
        setIsDepositOpen(false);
        setSubmittedRefundAddress(undefined);
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

    const isSelectionIncomplete = !selectedToken || !selectedMethod;

    return (
        <div className={clsx(styles.widget, className)} {...props}>
            <OnrampTokenSelectors
                className={styles.selectors}
                from={{
                    title: selectedToken?.symbol ?? '',
                    logoSrc: selectedToken?.logo,
                    loading: !selectedToken && isLoadingSupportedCurrencies,
                    placeholder: t('cryptoOnramp.tokenToBuy'),
                }}
                to={{
                    title: selectedMethod?.symbol ?? '',
                    logoSrc: selectedMethod?.logo,
                    networkLogoSrc: selectedMethod ? getChainInfo(selectedMethod.chain, chains).logo : undefined,
                    loading: !selectedMethod && isLoadingSupportedCurrencies,
                    placeholder: t('cryptoOnramp.method'),
                }}
                onFromClick={() => setIsTokenSelectOpen(true)}
                onToClick={() => setIsMethodSelectOpen(true)}
            />

            <div className={styles.inputSection}>
                {isSelectionIncomplete && isLoadingSupportedCurrencies ? (
                    <Skeleton width={120} height={48} />
                ) : (
                    <CenteredAmountInput
                        className={styles.input}
                        value={amount}
                        onValueChange={setAmount}
                        disabled={!isWalletConnected || isSelectionIncomplete}
                        ticker={amountInputMode === 'token' ? selectedToken?.symbol : selectedMethod?.symbol}
                        onClick={!isWalletConnected ? handleConnect : undefined}
                    />
                )}

                <AmountReversed
                    className={styles.converted}
                    value={convertedAmount}
                    onChangeDirection={
                        isReversedAmountSupported && !isSelectionIncomplete
                            ? () => setAmountInputMode(amountInputMode === 'token' ? 'method' : 'token')
                            : undefined
                    }
                    ticker={amountInputMode === 'token' ? selectedMethod?.symbol : selectedToken?.symbol}
                    decimals={
                        amountInputMode === 'token' ? (selectedMethod?.decimals ?? 0) : (selectedToken?.decimals ?? 0)
                    }
                    isLoading={isSelectionIncomplete && isLoadingSupportedCurrencies}
                />
            </div>

            <AmountPresets
                className={styles.presets}
                presets={presetAmounts}
                onPresetSelect={setAmount}
                disabled={isSelectionIncomplete}
            />

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

                    {isLoadingQuote && <InfoBlock.ValueSkeleton />}
                    {!isLoadingQuote && isSelectionIncomplete && <InfoBlock.Value>—</InfoBlock.Value>}
                    {!isLoadingQuote && !isSelectionIncomplete && (
                        <InfoBlock.Value>
                            {formatOnrampAmount(
                                amountInputMode === 'token' ? amount : convertedAmount,
                                selectedToken?.decimals,
                            )}{' '}
                            {selectedToken?.symbol}
                        </InfoBlock.Value>
                    )}
                </InfoBlock.Row>

                {isWalletConnected && (
                    <InfoBlock.Row>
                        <InfoBlock.Label>{t('cryptoOnramp.yourBalance')}</InfoBlock.Label>

                        {isLoadingTargetBalance && <InfoBlock.ValueSkeleton />}
                        {!isLoadingTargetBalance && !selectedToken && <InfoBlock.Value>—</InfoBlock.Value>}
                        {!isLoadingTargetBalance && selectedToken && (
                            <InfoBlock.Value>
                                {formatOnrampAmount(targetBalance || '0', selectedToken.decimals)}{' '}
                                {selectedToken.symbol}
                            </InfoBlock.Value>
                        )}
                    </InfoBlock.Row>
                )}

                <InfoBlock.Row>
                    <InfoBlock.Label>{t('cryptoOnramp.provider')}</InfoBlock.Label>
                    {providerName === undefined && isProvidersMetadataLoading ? (
                        <InfoBlock.ValueSkeleton />
                    ) : (
                        <InfoBlock.Value>{providerName ?? ''}</InfoBlock.Value>
                    )}
                </InfoBlock.Row>
            </InfoBlock.Container>

            <TokenSelectModal
                open={isTokenSelectOpen}
                onClose={() => setIsTokenSelectOpen(false)}
                tokens={tokensForSelect}
                onSelect={setSelectedToken}
                title={t('cryptoOnramp.tokenToBuy')}
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
                refundAddress={submittedRefundAddress}
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
                providersMetadata={providersMetadata}
                isProvidersMetadataLoading={isProvidersMetadataLoading}
                onProviderChange={setProviderId}
            />
        </div>
    );
};
