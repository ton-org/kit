/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

export default {
    // Wallet connection
    wallet: {
        connect: 'Connect',
        disconnect: 'Disconnect',
        connectWallet: 'Connect Wallet',
        noWalletsFound: 'No wallets found',
    },

    // Transaction
    transaction: {
        sendTransaction: 'Send Transaction',
        processing: 'Processing...',
        status: {
            pending: 'Processing...',
            completed: 'Success',
            failed: 'Failed',
        },
    },

    // Balances
    balances: {
        sendTon: 'Send {{ amount }} GRAM',
        sendJetton: 'Send {{ symbol }}',
        sendJettonWithAmount: 'Send {{ amount }} {{ symbol }}',
    },

    // NFT
    nft: {
        onSale: 'On Sale',
    },

    // Token select modal (shared between swap, etc.)
    tokenSelect: {
        emptyNoMatch: "We didn't find any tokens.",
        emptyTryAddress: 'Try searching by address.',
        emptyForNetwork: 'No tokens available for the selected network.',
        otherTokens: 'Other Tokens',
        otherCurrencies: 'Other Currencies',
    },

    // Shared DeFi error messages (rendered by `mapDefiError`)
    defi: {
        unsupportedNetwork: 'Network is not supported',
        networkError: 'Network error, please try again',
        providerNotFound: 'Provider not found',
        noDefaultProvider: 'No provider configured',
        invalidProvider: 'Invalid provider',
        invalidParams: 'Invalid parameters',
    },

    // Swap
    swap: {
        pay: 'Pay',
        receive: 'Receive',
        max: 'MAX',
        continue: 'Continue',
        enterAmount: 'Enter an amount',
        insufficientBalance: 'Insufficient balance',
        tooManyDecimals: 'Too many decimal places',
        quoteError: 'Unable to get a quote',
        invalidQuote: 'Quote is invalid',
        insufficientLiquidity: 'Insufficient liquidity for this swap',
        quoteExpired: 'Quote expired, please try again',
        buildTxFailed: "Couldn't build the swap transaction",
        selectToken: 'Select Token',
        searchToken: 'Search...',
        settings: 'Settings',
        slippage: 'Slippage',
        slippageError: 'The maximum slippage tolerance cannot be more than 50%. The recommended range is 1%',
        slippageWarning: 'High slippage tolerance increases the risk of an unfavorable trade',
        provider: 'Provider',
        save: 'Save',
        minReceived: 'Min Received',
        confirmTitle: 'Confirm swap transaction',
        confirm: 'Confirm',
        sendFailed: 'Transaction failed',
        loading: 'Loading...',
    },

    // Low balance modal (shared between swap, staking, etc.)
    lowBalance: {
        title: 'Not enough GRAM',
        messageReduce:
            'This operation requires ~{{ amount }} GRAM which exceeds your GRAM balance. Reduce the amount to continue.',
        messageTopup:
            'This operation needs ~{{ amount }} GRAM to cover network fees. Top up your GRAM balance to continue.',
        messageGasless:
            'This operation needs ~{{ amount }} GRAM which exceeds your GRAM balance. Switch to gasless to pay the fee in a jetton instead.',
        change: 'Change amount',
        switchToGasless: 'Switch to gasless',
        cancel: 'Cancel',
        close: 'Close',
    },

    // Crypto Onramp
    cryptoOnramp: {
        depositModalTitle: 'Crypto deposit',
        sendExactAmount: 'Send the exact amount to the address below',
        youNeedToSend: 'You need to send',
        toThisAddress: 'To this address',
        refundAddress: 'Refund address',
        memoTag: 'Memo / Tag',
        transactionDetails: 'Transaction details',
        deposit: 'Deposit',
        continue: 'Continue',
        methodOfPurchase: 'Method of purchase',
        tokenToBuy: 'Token to buy',
        method: 'Method',
        allNetworks: 'All networks',
        selectMethod: 'Select payment method',
        searchMethod: 'Search',
        quoteError: 'Failed to get a quote',
        depositFailed: 'Failed to create deposit',
        tooManyDecimals: 'Too many decimals',
        providerError: 'Provider error',
        genericError: 'Something went wrong',
        addressTab: 'Address',
        memoTab: 'Memo',
        youGet: 'You get',
        exchangeRate: 'Exchange rate',
        provider: 'Provider',
        refundAddressModalTitle: 'Refund address',
        refundAddressLabel:
            'Enter the address on the source network where the funds will be returned in case of a problem with the exchange',
        refundAddressRequired: 'Refund address is required',
        skipRefundAddress: 'Skip',
        reversedAmountNotSupported: 'This provider only supports entering the source amount',
        unsupportedSourceChain: 'Unsupported chain',
        unsupportedSourceToken: 'Unsupported source token',
        unsupportedDestinationToken: 'Unsupported destination token',
        routeNotFound: 'No route available for this pair',
        amountTooLarge: 'Amount is too high',
        amountTooSmall: 'Amount is too low',
        invalidRefundAddress: 'Invalid refund address',
        refundAddressPlaceholder: 'Your address',
        yourBalance: 'Your balance',
        statusPending: 'Waiting for your transfer',
        statusSuccess: 'Transfer completed',
        statusFailed: 'Transfer failed',
        done: 'Done',
        close: 'Close',
        settings: 'Settings',
        save: 'Save',
    },

    // Onramp
    onramp: {
        continue: 'Continue',
        selectToken: 'Token to buy',
        searchToken: 'Search tokens',
        selectCurrency: 'Select currency',
        searchCurrency: 'Search currencies',
        checkout: 'Checkout',
        buyToken: 'Buy {{ symbol }}',
        forCurrency: 'for {{ symbol }}',
        noQuotesFound: 'No quotes found',
        connectWallet: 'Connect a wallet to continue',
        tonPayError: 'Failed to start TonPay checkout',
        youGet: 'You get',
        exchangeRate: 'Exchange rate',
    },

    // Staking
    staking: {
        stake: 'Stake',
        unstake: 'Unstake',
        continue: 'Stake',
        insufficientBalance: 'Insufficient balance',
        tooManyDecimals: 'Too many decimal places',
        quoteError: 'Unable to get a quote',
        invalidParams: 'Invalid staking parameters',
        unsupportedOperation: 'Operation not supported by this provider',
        youGet: 'You get',
        currentApy: 'Current APY',
        max: 'MAX',
        exchangeRate: 'Exchange rate',
        stakedBalance: 'Staked balance',
        unstakeType: 'Unstake type',
        maximumReward: 'Maximum reward',
        instant: 'Instant',
        instantLimit: 'Limit: {{ limit }}',
        maximumRewardLimit: 'Next cycle',
        whenAvailable: 'When available',
        whenAvailableLimit: 'No limits',
        yourBalance: 'Your balance',
        provider: 'Provider',
        settings: 'Settings',
        save: 'Save',
        confirmStakingTitle: 'Confirm staking',
        confirmUnstakingTitle: 'Confirm unstaking',
        confirm: 'Confirm',
        sendFailed: 'Transaction failed',
        loading: 'Loading...',
    },
} as const;
