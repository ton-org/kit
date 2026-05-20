/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { createContext, useContext } from 'react';
import type {
    CryptoOnrampDeposit,
    CryptoOnrampDestinationCurrency,
    CryptoOnrampProvider,
    CryptoOnrampQuote,
    CryptoOnrampSourceCurrency,
    CryptoOnrampStatus,
} from '@ton/appkit';

import type { CryptoOnrampProvidersMetadata } from './use-crypto-onramp-providers-with-metadata';
import { DEFAULT_ONRAMP_PRESETS } from '../../../constants';
import type { ChainInfo } from '../utils/chains';
import { DEFAULT_CHAINS } from '../utils/chains';
import type { OnrampAmountPreset } from '../../../types';

export type CryptoAmountInputMode = 'token' | 'method';

export interface CryptoOnrampContextType {
    /** Full list of tokens to buy (TON-side) */
    tokens: CryptoOnrampDestinationCurrency[];
    /** Currently selected token to buy */
    selectedToken: CryptoOnrampDestinationCurrency | null;
    setSelectedToken: (token: CryptoOnrampDestinationCurrency) => void;

    /** Available crypto payment methods (source side) */
    paymentMethods: CryptoOnrampSourceCurrency[];
    /** Currently selected payment method */
    selectedMethod: CryptoOnrampSourceCurrency | null;
    setSelectedMethod: (method: CryptoOnrampSourceCurrency) => void;
    /** CAIP-2 → chain display info map (defaults merged with consumer overrides) */
    chains: Record<string, ChainInfo>;

    /** Current amount input value */
    amount: string;
    setAmount: (value: string) => void;
    /** Whether user is entering token amount or payment-method amount */
    amountInputMode: CryptoAmountInputMode;
    setAmountInputMode: (mode: CryptoAmountInputMode) => void;
    /** Converted amount from quote */
    convertedAmount: string;
    presetAmounts: OnrampAmountPreset[];

    /** Currently selected crypto-onramp provider (defaults to the first registered one) */
    provider: CryptoOnrampProvider | undefined;
    /** All registered crypto-onramp providers */
    providers: CryptoOnrampProvider[];
    /** Resolved metadata for each provider, keyed by `providerId`. Entry is `undefined` while loading or on error. */
    providersMetadata: CryptoOnrampProvidersMetadata;
    /** True while any provider's metadata query is in its first load. */
    isProvidersMetadataLoading: boolean;
    /** Updates the selected crypto-onramp provider */
    setProviderId: (providerId: string) => void;

    /** Current quote from provider */
    quote: CryptoOnrampQuote | null;
    /** Whether quote is being fetched */
    isLoadingQuote: boolean;
    /** Error from quote fetch (i18n key) */
    quoteError: string | null;

    /** Current deposit offer from provider */
    deposit: CryptoOnrampDeposit | null;
    /** Whether deposit is being created */
    isCreatingDeposit: boolean;
    /** Error from deposit creation (i18n key) */
    depositError: string | null;
    /** Formatted deposit amount */
    depositAmount: string;
    /** Function to trigger deposit creation, optionally with a refund address */
    createDeposit: (refundAddress?: string) => void;
    /** Deposit status */
    depositStatus: CryptoOnrampStatus | null;

    /**
     * Refund-address collection mode for the current provider:
     * `'off'` — skip the address modal; `'optional'` — show modal with a Skip button;
     * `'required'` — show modal, address mandatory.
     */
    refundAddressMode: 'off' | 'optional' | 'required';
    /** Whether the current quote provider supports reversed (target-amount) input */
    isReversedAmountSupported: boolean;

    /** User's balance of the selected target token (formatted, token units) */
    targetBalance: string;
    /** Whether the target token balance is being fetched */
    isLoadingTargetBalance: boolean;

    /** Whether a TON wallet is currently connected */
    isWalletConnected: boolean;

    /** Whether the user can proceed (valid amount + quote available + wallet connected) */
    canContinue: boolean;
    /** Reset state (invalidate quote and clear deposit) */
    onReset: () => void;
}

const defaultContext: CryptoOnrampContextType = {
    tokens: [],
    selectedToken: null,
    setSelectedToken: () => {},
    paymentMethods: [],
    selectedMethod: null,
    setSelectedMethod: () => {},
    chains: DEFAULT_CHAINS,
    amount: '',
    setAmount: () => {},
    amountInputMode: 'method',
    setAmountInputMode: () => {},
    convertedAmount: '',
    presetAmounts: DEFAULT_ONRAMP_PRESETS,

    provider: undefined,
    providers: [],
    providersMetadata: {},
    isProvidersMetadataLoading: false,
    setProviderId: () => {},

    quote: null,
    isLoadingQuote: false,
    quoteError: null,

    deposit: null,
    isCreatingDeposit: false,
    depositError: null,
    depositAmount: '',
    createDeposit: () => {},
    depositStatus: null,

    refundAddressMode: 'off',
    isReversedAmountSupported: true,

    targetBalance: '',
    isLoadingTargetBalance: false,

    isWalletConnected: false,

    canContinue: false,
    onReset: () => {},
};

export const CryptoOnrampContext = createContext<CryptoOnrampContextType>(defaultContext);

export const useCryptoOnrampContext = (): CryptoOnrampContextType => {
    return useContext(CryptoOnrampContext);
};
