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
        settings: 'Swap settings',
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
        settings: 'Staking settings',
        save: 'Save',
        confirmStakingTitle: 'Confirm staking',
        confirmUnstakingTitle: 'Confirm unstaking',
        confirm: 'Confirm',
        sendFailed: 'Transaction failed',
        loading: 'Loading...',
    },
} as const;
