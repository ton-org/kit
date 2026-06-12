/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useState } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaking, useWallet } from '@demo/wallet-core';
import { UnstakeMode } from '@ton/walletkit';

import { StakingSettings } from '../staking-settings';
import { StakingInfo } from '../staking-info';

import { Button } from '@/core/components/ui/button';
import { CenteredAmountInput } from '@/core/components/ui/centered-amount-input';
import { cn } from '@/core/lib/utils';
import { formatLargeValue } from '@/core/utils';
import { formatUnits } from '@/core/utils/units';

const GRAM_DECIMALS = 9;
/**
 * GRAM kept aside on a stake so the transaction still has gas (and the account stays
 * funded). Mirrors the staking widget's 1.2 TON `feeReserveNanos` in appkit-react.
 */
const STAKE_GAS_RESERVE = 1.2;
const STAKE_TICKER = 'GRAM';
const STAKED_TICKER = 'tsTON';

const UNSTAKE_MODES = [
    { mode: UnstakeMode.INSTANT, label: 'Instant', hint: 'Receive GRAM immediately' },
    { mode: UnstakeMode.WHEN_AVAILABLE, label: 'When available', hint: 'Immediate if liquid, or up to ~18h queue' },
    { mode: UnstakeMode.ROUND_END, label: 'Round end', hint: 'Wait for cycle end (~18h) for best rate' },
];

export const StakingInterface: FC = () => {
    const navigate = useNavigate();
    const { balance } = useWallet();
    const {
        amount,
        currentQuote,
        isLoadingQuote,
        isStaking,
        isUnstaking,
        error,
        unstakeMode,
        stakedBalance,
        providerId,
        setStakingAmount: setAmount,
        setUnstakeMode,
        setStakingProviderId,
        getStakingQuote: getQuote,
        stake,
        unstake,
        validateStakingInputs,
    } = useStaking();

    const [tab, setTab] = useState<'stake' | 'unstake'>('stake');
    const isStake = tab === 'stake';

    const availableGram = formatUnits(balance || '0', GRAM_DECIMALS);
    const stakedTs = stakedBalance?.stakedBalance ?? '0';

    const handleTab = (next: 'stake' | 'unstake') => {
        setTab(next);
        setAmount('');
    };

    const handleAmountChange = (raw: string) => {
        // Keep digits and a single decimal separator (the input is free-form text).
        setAmount(raw.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'));
    };

    const handleMax = () => {
        if (isStake) {
            const max = parseFloat(availableGram) - STAKE_GAS_RESERVE;
            if (max > 0) setAmount(String(max));
        } else if (parseFloat(stakedTs) > 0) {
            setAmount(stakedTs);
        }
    };

    const handlePreview = async () => {
        await getQuote({ amount, direction: isStake ? 'stake' : 'unstake' });
    };

    const handleAction = async () => {
        if (!currentQuote) return;
        const ok = isStake ? await stake({ quote: currentQuote }) : await unstake({ quote: currentQuote });
        if (ok) navigate('/wallet', { state: { message: `${isStake ? 'Staked' : 'Unstaked'} successfully!` } });
    };

    const amountNumber = parseFloat(amount) || 0;
    // Max GRAM that can be staked while keeping the gas reserve (the threshold).
    const stakeMax = Math.max(0, parseFloat(availableGram) - STAKE_GAS_RESERVE);
    // Direction-aware balance guard: a stake spends GRAM (and must leave gas), an unstake
    // spends staked tsTON.
    let balanceError = '';
    if (amountNumber > 0) {
        if (isStake) {
            if (amountNumber > parseFloat(availableGram)) {
                balanceError = 'Insufficient balance';
            } else if (amountNumber > stakeMax) {
                balanceError = `Keep ~${STAKE_GAS_RESERVE} GRAM for network fees`;
            }
        } else if (amountNumber > parseFloat(stakedTs)) {
            balanceError = 'Not enough staked';
        }
    }
    const validationError = validateStakingInputs();
    const canPreview = Boolean(!validationError && !balanceError && amountNumber > 0);
    const isSending = isStaking || isUnstaking;
    // Receive side (shown once a quote exists): stake → tsTON, unstake → GRAM.
    const receiveTicker = isStake ? STAKED_TICKER : STAKE_TICKER;
    const activeHint = UNSTAKE_MODES.find((m) => m.mode === unstakeMode)?.hint;

    return (
        <div className="space-y-5">
            {/* Stake / Unstake tabs */}
            <div className="flex rounded-2xl bg-gray-100 p-1">
                {(['stake', 'unstake'] as const).map((value) => (
                    <button
                        key={value}
                        type="button"
                        onClick={() => handleTab(value)}
                        className={cn(
                            'flex-1 rounded-xl py-2.5 text-sm font-semibold capitalize transition-colors',
                            tab === value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
                        )}
                    >
                        {value}
                    </button>
                ))}
            </div>

            {/* Amount */}
            <div className="py-2">
                <CenteredAmountInput
                    value={amount}
                    onValueChange={handleAmountChange}
                    ticker={isStake ? STAKE_TICKER : STAKED_TICKER}
                    baseTestId="stake-amount"
                />
            </div>

            {/* Balances + Max */}
            <div className="space-y-2 rounded-2xl bg-gray-100 p-4 text-sm">
                <div className="flex items-center justify-between">
                    <span className="text-gray-500">Available</span>
                    <span className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 tabular-nums">
                            {formatLargeValue(availableGram, 4)} GRAM
                        </span>
                        {isStake && parseFloat(availableGram) > 0 && (
                            <button
                                type="button"
                                onClick={handleMax}
                                className="font-semibold text-blue-600 hover:text-blue-700"
                            >
                                Max
                            </button>
                        )}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-500">Staked</span>
                    <span className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 tabular-nums">
                            {formatLargeValue(stakedTs, 4)} tsTON
                        </span>
                        {!isStake && parseFloat(stakedTs) > 0 && (
                            <button
                                type="button"
                                onClick={handleMax}
                                className="font-semibold text-blue-600 hover:text-blue-700"
                            >
                                Max
                            </button>
                        )}
                    </span>
                </div>
            </div>

            {/* Unstake method */}
            {!isStake && (
                <div className="space-y-2">
                    <span className="block text-sm font-medium text-gray-700">Unstake method</span>
                    <div className="grid grid-cols-3 gap-2">
                        {UNSTAKE_MODES.map(({ mode, label }) => (
                            <button
                                key={mode}
                                type="button"
                                onClick={() => setUnstakeMode(mode)}
                                className={cn(
                                    'rounded-xl border-2 py-2 text-xs font-semibold transition-colors',
                                    unstakeMode === mode
                                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                                        : 'border-transparent bg-gray-100 text-gray-700 hover:bg-gray-200',
                                )}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    {activeHint && <p className="text-xs text-gray-500">{activeHint}</p>}
                </div>
            )}

            {(balanceError || error) && (
                <p className="rounded-2xl bg-red-50 p-3 text-center text-sm text-red-500">{balanceError || error}</p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
                {!currentQuote ? (
                    <Button
                        type="button"
                        fullWidth
                        onClick={handlePreview}
                        loading={isLoadingQuote}
                        disabled={!canPreview || isLoadingQuote}
                    >
                        {isStake ? 'Preview Stake' : 'Preview Unstake'}
                    </Button>
                ) : (
                    <>
                        <Button
                            type="button"
                            variant="secondary"
                            fullWidth
                            onClick={() => setAmount('')}
                            disabled={isSending}
                        >
                            Cancel
                        </Button>
                        <Button type="button" fullWidth onClick={handleAction} loading={isSending} disabled={isSending}>
                            {isStake ? 'Stake' : 'Unstake'}
                        </Button>
                    </>
                )}
                <StakingSettings providerId={providerId} setProviderId={setStakingProviderId} />
            </div>

            <StakingInfo receiveTicker={receiveTicker} />
        </div>
    );
};
