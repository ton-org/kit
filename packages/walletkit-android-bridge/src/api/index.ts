/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { WalletKitBridgeApi } from '../types';
import * as initialization from './initialization';
import * as cryptography from './cryptography';
import * as wallets from './wallets';
import * as transactions from './transactions';
import * as requests from './requests';
import * as tonconnect from './tonconnect';
import * as nft from './nft';
import * as jettons from './jettons';
import * as staking from './staking';
import * as browser from './browser';
import * as streaming from './streaming';
import * as swap from './swap';
import * as gasless from './gasless';
import * as walletClient from './walletClient';
import { eventListeners } from './eventListeners';

export { eventListeners };

export const api = {
    init: initialization.init,
    setEventsListeners: initialization.setEventsListeners,
    removeEventListeners: initialization.removeEventListeners,

    mnemonicToKeyPair: cryptography.mnemonicToKeyPair,
    sign: cryptography.sign,
    createTonMnemonic: cryptography.createTonMnemonic,

    createSignerFromMnemonic: wallets.createSignerFromMnemonic,
    createSignerFromPrivateKey: wallets.createSignerFromPrivateKey,
    createSignerFromCustom: wallets.createSignerFromCustom,
    createV5R1WalletAdapter: wallets.createV5R1WalletAdapter,
    createV4R2WalletAdapter: wallets.createV4R2WalletAdapter,

    addWallet: wallets.addWallet,
    releaseRef: wallets.releaseRef,
    getWallets: wallets.getWallets,
    getWallet: wallets.getWalletById,
    getWalletAddress: wallets.getWalletAddress,
    getWalletNetwork: wallets.getWalletNetwork,
    getWalletPublicKey: wallets.getWalletPublicKey,
    getWalletStateInit: wallets.getWalletStateInit,
    getSignedSignMessage: wallets.getSignedSignMessage,
    getSignedSendTransaction: wallets.getSignedSendTransaction,
    getSignedSignData: wallets.getSignedSignData,
    getSignedTonProof: wallets.getSignedTonProof,
    removeWallet: wallets.removeWallet,
    getBalance: wallets.getBalance,

    getRecentTransactions: transactions.getRecentTransactions,
    createTransferTonTransaction: transactions.createTransferTonTransaction,
    createTransferMultiTonTransaction: transactions.createTransferMultiTonTransaction,
    getTransactionPreview: transactions.getTransactionPreview,
    handleNewTransaction: transactions.handleNewTransaction,
    sendTransaction: transactions.sendTransaction,

    approveConnectRequest: requests.approveConnectRequest,
    rejectConnectRequest: requests.rejectConnectRequest,
    approveTransactionRequest: requests.approveTransactionRequest,
    rejectTransactionRequest: requests.rejectTransactionRequest,
    approveSignDataRequest: requests.approveSignDataRequest,
    rejectSignDataRequest: requests.rejectSignDataRequest,
    approveSignMessageRequest: requests.approveSignMessageRequest,
    rejectSignMessageRequest: requests.rejectSignMessageRequest,

    handleTonConnectUrl: tonconnect.handleTonConnectUrl,
    connectionEventFromUrl: tonconnect.connectionEventFromUrl,
    listSessions: tonconnect.listSessions,
    disconnectSession: tonconnect.disconnectSession,
    processInternalBrowserRequest: tonconnect.processInternalBrowserRequest,

    getNfts: nft.getNfts,
    getNft: nft.getNft,
    createTransferNftTransaction: nft.createTransferNftTransaction,
    createTransferNftRawTransaction: nft.createTransferNftRawTransaction,

    getJettons: jettons.getJettons,
    createTransferJettonTransaction: jettons.createTransferJettonTransaction,
    getJettonBalance: jettons.getJettonBalance,
    getJettonWalletAddress: jettons.getJettonWalletAddress,
    getJettonInfo: jettons.getJettonInfo,
    getAddressJettons: jettons.getAddressJettons,
    validateJettonAddress: jettons.validateJettonAddress,

    emitBrowserPageStarted: browser.emitBrowserPageStarted,
    emitBrowserPageFinished: browser.emitBrowserPageFinished,
    emitBrowserError: browser.emitBrowserError,
    emitBrowserBridgeRequest: browser.emitBrowserBridgeRequest,

    createTonCenterStreamingProvider: streaming.createTonCenterStreamingProvider,
    createTonApiStreamingProvider: streaming.createTonApiStreamingProvider,
    registerStreamingProvider: streaming.registerStreamingProvider,
    streamingHasProvider: streaming.streamingHasProvider,
    streamingWatch: streaming.streamingWatch,
    streamingUnwatch: streaming.streamingUnwatch,
    streamingConnect: streaming.streamingConnect,
    streamingDisconnect: streaming.streamingDisconnect,
    streamingWatchConnectionChange: streaming.streamingWatchConnectionChange,
    streamingWatchBalance: streaming.streamingWatchBalance,
    streamingWatchTransactions: streaming.streamingWatchTransactions,
    streamingWatchJettons: streaming.streamingWatchJettons,
    registerKotlinStreamingProvider: streaming.registerKotlinStreamingProvider,
    kotlinProviderDispatch: streaming.kotlinProviderDispatch,

    createTonStakersStakingProvider: staking.createTonStakersStakingProvider,
    registerStakingProvider: staking.registerStakingProvider,
    removeStakingProvider: staking.removeStakingProvider,
    setDefaultStakingProvider: staking.setDefaultStakingProvider,
    getRegisteredStakingProviders: staking.getRegisteredStakingProviders,
    hasStakingProvider: staking.hasStakingProvider,
    getStakingQuote: staking.getStakingQuote,
    buildStakeTransaction: staking.buildStakeTransaction,
    getStakedBalance: staking.getStakedBalance,
    getStakingProviderInfo: staking.getStakingProviderInfo,
    getStakingProviderMetadata: staking.getStakingProviderMetadata,
    getStakingProviderSupportedNetworks: staking.getStakingProviderSupportedNetworks,
    registerKotlinStakingProvider: staking.registerKotlinStakingProvider,

    createOmnistonSwapProvider: swap.createOmnistonSwapProvider,
    createDeDustSwapProvider: swap.createDeDustSwapProvider,
    registerSwapProvider: swap.registerSwapProvider,
    removeSwapProvider: swap.removeSwapProvider,
    setDefaultSwapProvider: swap.setDefaultSwapProvider,
    getRegisteredSwapProviders: swap.getRegisteredSwapProviders,
    getSwapProviderMetadata: swap.getSwapProviderMetadata,
    getSwapProviderSupportedNetworks: swap.getSwapProviderSupportedNetworks,
    hasSwapProvider: swap.hasSwapProvider,
    getSwapQuote: swap.getSwapQuote,
    buildSwapTransaction: swap.buildSwapTransaction,
    registerKotlinSwapProvider: swap.registerKotlinSwapProvider,

    createTonApiGaslessProvider: gasless.createTonApiGaslessProvider,
    registerGaslessProvider: gasless.registerGaslessProvider,
    removeGaslessProvider: gasless.removeGaslessProvider,
    setDefaultGaslessProvider: gasless.setDefaultGaslessProvider,
    getRegisteredGaslessProviders: gasless.getRegisteredGaslessProviders,
    hasGaslessProvider: gasless.hasGaslessProvider,
    getGaslessProviderSupportedNetworks: gasless.getGaslessProviderSupportedNetworks,
    getGaslessMetadata: gasless.getGaslessMetadata,
    getGaslessConfig: gasless.getGaslessConfig,
    getGaslessQuote: gasless.getGaslessQuote,
    gaslessSendTransaction: gasless.gaslessSendTransaction,
    walletClientSendBoc: walletClient.walletClientSendBoc,
    walletClientRunGetMethod: walletClient.walletClientRunGetMethod,
    walletClientGetBalance: walletClient.walletClientGetBalance,
    walletClientGetMasterchainInfo: walletClient.walletClientGetMasterchainInfo,
    walletClientNftItemsByAddress: walletClient.walletClientNftItemsByAddress,
    walletClientNftItemsByOwner: walletClient.walletClientNftItemsByOwner,
    walletClientFetchEmulation: walletClient.walletClientFetchEmulation,
    walletClientAccountState: walletClient.walletClientAccountState,
    walletClientAccountStates: walletClient.walletClientAccountStates,
    walletClientResolveDnsWallet: walletClient.walletClientResolveDnsWallet,
    walletClientBackResolveDnsWallet: walletClient.walletClientBackResolveDnsWallet,
} as unknown as WalletKitBridgeApi;
