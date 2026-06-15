/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
    asAddressFriendly,
    compareAddress,
    createJettonTransferPayload,
    createTransferTransaction,
    DEFAULT_JETTON_GAS_FEE,
} from '@ton/walletkit';
import type { SendTransactionResponse } from '@ton/walletkit';

import { createComponentLogger } from '../../utils/logger';
import type { SetState, GaslessSliceCreator } from '../../types/store';

const log = createComponentLogger('GaslessSlice');

/** USDT (Tether USD) jetton master on TON mainnet — preferred default fee asset. */
const USDT_MASTER_MAINNET = 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs';

/** Pick the default fee asset from the relayer list — USDT if accepted, else the first. */
const pickDefaultFeeAsset = (supportedAssets: { address: string }[]): string | null => {
    if (supportedAssets.length === 0) return null;
    const usdt = supportedAssets.find((asset) => compareAddress(asset.address, USDT_MASTER_MAINNET));
    return usdt?.address ?? supportedAssets[0].address;
};

export const createGaslessSlice: GaslessSliceCreator = (set: SetState, get) => {
    // Monotonic id for quote requests. A slower, superseded response (older request
    // resolving after a newer one, or after the quote was cleared) is dropped so it
    // can't overwrite a fresher quote or leave a stale spinner. Anything that
    // invalidates an in-flight quote bumps this; the response checks it on resolve.
    let latestQuoteId = 0;
    const cancelInFlightQuote = (): number => (latestQuoteId += 1);

    return {
        gasless: {
            enabled: false,
            feeAsset: null,
            supportedAssets: [],
            relayAddress: null,
            currentQuote: null,
            isLoadingConfig: false,
            isLoadingQuote: false,
            isSending: false,
            error: null,
        },

        setGaslessEnabled: (enabled: boolean) => {
            cancelInFlightQuote();
            set((state) => {
                state.gasless.enabled = enabled;
                // Drop any stale error on each toggle; clear the quote when turning off.
                state.gasless.error = null;
                if (!enabled) {
                    state.gasless.currentQuote = null;
                    state.gasless.isLoadingQuote = false;
                }
            });
        },

        setGaslessFeeAsset: (address: string) => {
            cancelInFlightQuote();
            set((state) => {
                state.gasless.feeAsset = address;
                // Fee asset changed — the existing/in-flight quote no longer reflects it.
                state.gasless.currentQuote = null;
                state.gasless.isLoadingQuote = false;
            });
        },

        clearGaslessQuote: () => {
            cancelInFlightQuote();
            set((state) => {
                state.gasless.currentQuote = null;
                state.gasless.isLoadingQuote = false;
                state.gasless.error = null;
            });
        },

        loadGaslessConfig: async () => {
            const state = get();
            const kit = state.walletCore.walletKit;
            const network = state.walletManagement.currentWallet?.getNetwork();

            if (!kit || !network) return;

            set((state) => {
                state.gasless.isLoadingConfig = true;
            });

            try {
                const config = await kit.gasless.getConfig(network);

                set((state) => {
                    state.gasless.supportedAssets = config.supportedAssets;
                    state.gasless.relayAddress = config.relayAddress;
                    state.gasless.isLoadingConfig = false;
                    // Seed the fee asset on first load (USDT preferred), keep an existing pick.
                    if (!state.gasless.feeAsset) {
                        state.gasless.feeAsset = pickDefaultFeeAsset(config.supportedAssets);
                    }
                });
            } catch (error) {
                log.error('Failed to load gasless config:', error);
                set((state) => {
                    state.gasless.isLoadingConfig = false;
                    state.gasless.error = error instanceof Error ? error.message : 'Failed to load gasless config';
                });
            }
        },

        getGaslessQuote: async ({ recipientAddress, jettonAddress, transferAmount, comment }) => {
            const state = get();
            const wallet = state.walletManagement.currentWallet;
            const kit = state.walletCore.walletKit;

            if (!wallet || !kit) {
                set((state) => {
                    state.gasless.error = 'WalletKit not initialized';
                });
                return;
            }

            // The relayer config (relay address + fee asset) is loaded once via
            // `loadGaslessConfig` when gasless is enabled — see `useGaslessJettonSend`.
            const { feeAsset, relayAddress } = get().gasless;
            if (!feeAsset || !relayAddress) {
                set((state) => {
                    state.gasless.error = 'Gasless is not available on this network';
                });
                return;
            }

            // Claim this request's id; only the latest request may write the result.
            const requestId = cancelInFlightQuote();
            set((state) => {
                state.gasless.isLoadingQuote = true;
                state.gasless.error = null;
            });

            try {
                const network = wallet.getNetwork();
                const jettonWalletAddress = await wallet.getJettonWalletAddress(asAddressFriendly(jettonAddress));

                // `responseDestination = relayer`: the relayer fronts the message's TON
                // budget, so its unspent remainder returns to it rather than the user —
                // otherwise the relayer pads the commission to cover the loss.
                const payload = createJettonTransferPayload({
                    amount: BigInt(transferAmount),
                    destination: asAddressFriendly(recipientAddress),
                    responseDestination: asAddressFriendly(relayAddress),
                    comment,
                });

                const tx = createTransferTransaction({
                    targetAddress: jettonWalletAddress,
                    amount: DEFAULT_JETTON_GAS_FEE,
                    payload,
                    fromAddress: wallet.getAddress(),
                });

                const quote = await kit.gasless.getQuote({
                    network,
                    feeAsset: asAddressFriendly(feeAsset),
                    walletAddress: wallet.getAddress(),
                    walletPublicKey: wallet.getPublicKey(),
                    messages: tx.messages,
                });

                // Superseded while awaiting (newer request, fee-asset change, clear) —
                // discard so we don't overwrite the fresher state with a stale quote.
                if (requestId !== latestQuoteId) return;

                set((state) => {
                    state.gasless.currentQuote = quote;
                    state.gasless.isLoadingQuote = false;
                });
            } catch (error) {
                if (requestId !== latestQuoteId) return;

                log.error('Failed to get gasless quote:', error);
                set((state) => {
                    state.gasless.isLoadingQuote = false;
                    state.gasless.currentQuote = null;
                    state.gasless.error = error instanceof Error ? error.message : 'Failed to get gasless quote';
                });
            }
        },

        sendGasless: async (): Promise<SendTransactionResponse> => {
            const state = get();
            const { currentQuote } = state.gasless;
            const wallet = state.walletManagement.currentWallet;
            const kit = state.walletCore.walletKit;

            if (!currentQuote || !wallet || !kit) {
                throw new Error('Gasless quote not ready');
            }

            set((state) => {
                state.gasless.isSending = true;
                state.gasless.error = null;
            });

            try {
                const network = wallet.getNetwork();

                // Sign the relayer-wrapped messages locally → internal-message BoC the
                // relayer broadcasts (paying the gas). No approval modal: the wallet
                // holds the key and signs directly.
                const internalBoc = await wallet.getSignedSignMessage({
                    messages: currentQuote.messages,
                    validUntil: currentQuote.validUntil,
                    network,
                    fromAddress: wallet.getAddress(),
                });

                const result = await kit.gasless.sendTransaction({
                    network,
                    walletPublicKey: wallet.getPublicKey(),
                    internalBoc,
                });

                set((state) => {
                    state.gasless.isSending = false;
                    state.gasless.currentQuote = null;
                });

                return result;
            } catch (error) {
                log.error('Failed to send gasless transaction:', error);
                // Don't write to `gasless.error` here — the send error is surfaced by
                // the caller (it rethrows). `gasless.error` stays reserved for quote /
                // config failures shown inline, so the message isn't duplicated.
                set((state) => {
                    state.gasless.isSending = false;
                });
                throw error;
            }
        },

        clearGasless: () => {
            cancelInFlightQuote();
            set((state) => {
                state.gasless.enabled = false;
                state.gasless.currentQuote = null;
                state.gasless.isLoadingQuote = false;
                state.gasless.isSending = false;
                state.gasless.error = null;
            });
        },
    };
};
