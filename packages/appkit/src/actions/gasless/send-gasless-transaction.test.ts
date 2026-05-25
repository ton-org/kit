/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

import { GaslessErrorCode } from '../../gasless';
import type { GaslessQuote } from '../../gasless';
import { Network } from '../../types/network';
import type { AppKit } from '../../core/app-kit';
import type { Base64String } from '../../types/primitives';
import type { Feature, WalletInterface } from '../../types/wallet';
import { sendGaslessTransaction } from './send-gasless-transaction';

const TEST_ADDRESS = 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs';
const FAKE_INTERNAL_BOC = 'te6cckEBAQEAAgAAAA==' as Base64String;

const makeQuote = (overrides: Partial<GaslessQuote> = {}): GaslessQuote => ({
    network: Network.mainnet(),
    messages: [{ address: TEST_ADDRESS, amount: '60000000' }],
    fee: '1234',
    validUntil: Math.floor(Date.now() / 1000) + 60,
    from: TEST_ADDRESS,
    ...overrides,
});

const SIGN_MESSAGE_FEATURE: Feature = { name: 'SignMessage', maxMessages: 4 };

const makeWallet = (overrides: Partial<WalletInterface> = {}): WalletInterface => {
    return {
        connectorId: 'tonconnect',
        getAddress: () => TEST_ADDRESS,
        getPublicKey: () => '0xabc' as never,
        getNetwork: () => ({ chainId: '-239' }) as never,
        getWalletId: () => 'wallet-1',
        getSupportedFeatures: () => [SIGN_MESSAGE_FEATURE],
        sendTransaction: vi.fn(),
        signData: vi.fn(),
        signMessage: vi.fn().mockResolvedValue({ internalBoc: FAKE_INTERNAL_BOC }),
        ...overrides,
    } as WalletInterface;
};

type MockSendResult = { boc: string; normalizedBoc: string; normalizedHash: string; internalBoc: string };

const DEFAULT_SEND_RESULT: MockSendResult = {
    boc: 'external_boc_b64',
    normalizedBoc: 'normalized_b64',
    normalizedHash: '0xabcdef',
    internalBoc: FAKE_INTERNAL_BOC,
};

const makeAppKit = (wallet: WalletInterface | null) => {
    const sendTransaction = vi.fn<() => Promise<MockSendResult>>().mockResolvedValue({ ...DEFAULT_SEND_RESULT });

    const appKit = {
        walletsManager: { selectedWallet: wallet },
        gaslessManager: { sendTransaction },
    } as unknown as AppKit;

    return { appKit, sendTransaction };
};

describe('sendGaslessTransaction', () => {
    let wallet: WalletInterface;

    beforeEach(() => {
        wallet = makeWallet();
    });

    it('signs the quote and forwards SendTransactionResponse-shaped fields from the relayer', async () => {
        const { appKit, sendTransaction } = makeAppKit(wallet);
        const quote = makeQuote();

        const result = await sendGaslessTransaction(appKit, { quote });

        expect(wallet.signMessage).toHaveBeenCalledWith({
            messages: quote.messages,
            validUntil: quote.validUntil,
        });
        expect(sendTransaction).toHaveBeenCalledWith(
            { network: quote.network, walletPublicKey: '0xabc', internalBoc: FAKE_INTERNAL_BOC },
            undefined,
        );
        expect(result.internalBoc).toBe(FAKE_INTERNAL_BOC);
        expect(result.boc).toBe(DEFAULT_SEND_RESULT.boc);
        expect(result.normalizedBoc).toBe(DEFAULT_SEND_RESULT.normalizedBoc);
        expect(result.normalizedHash).toBe(DEFAULT_SEND_RESULT.normalizedHash);
    });

    it('forwards providerId to gaslessManager.sendTransaction', async () => {
        const { appKit, sendTransaction } = makeAppKit(wallet);

        await sendGaslessTransaction(appKit, { quote: makeQuote(), providerId: 'custom' });

        expect(sendTransaction).toHaveBeenCalledWith(expect.anything(), 'custom');
    });

    it('throws plain Error when no wallet is connected', async () => {
        const { appKit } = makeAppKit(null);

        await expect(sendGaslessTransaction(appKit, { quote: makeQuote() })).rejects.toThrow('Wallet not connected');
    });

    it('throws GaslessError(SIGN_MESSAGE_NOT_SUPPORTED) when wallet lacks SignMessage feature', async () => {
        const walletWithoutFeature = makeWallet({
            getSupportedFeatures: () => [{ name: 'SignData' } as never],
        });
        const { appKit } = makeAppKit(walletWithoutFeature);

        await expect(sendGaslessTransaction(appKit, { quote: makeQuote() })).rejects.toMatchObject({
            name: 'GaslessError',
            code: GaslessErrorCode.SignMessageNotSupported,
        });
        expect(walletWithoutFeature.signMessage).not.toHaveBeenCalled();
    });

    it('throws GaslessError(TOO_MANY_MESSAGES) when quote exceeds wallet maxMessages', async () => {
        const walletWithCap = makeWallet({
            getSupportedFeatures: () => [{ name: 'SignMessage', maxMessages: 1 }],
        });
        const { appKit } = makeAppKit(walletWithCap);
        const quote = makeQuote({
            messages: [
                { address: TEST_ADDRESS, amount: '1' },
                { address: TEST_ADDRESS, amount: '2' },
            ],
        });

        await expect(sendGaslessTransaction(appKit, { quote })).rejects.toMatchObject({
            name: 'GaslessError',
            code: GaslessErrorCode.TooManyMessages,
        });
        expect(walletWithCap.signMessage).not.toHaveBeenCalled();
    });

    it('proceeds when wallet returns undefined features (unknown capabilities)', async () => {
        const walletWithUnknown = makeWallet({ getSupportedFeatures: () => undefined });
        const { appKit, sendTransaction } = makeAppKit(walletWithUnknown);

        await sendGaslessTransaction(appKit, { quote: makeQuote() });

        expect(walletWithUnknown.signMessage).toHaveBeenCalled();
        expect(sendTransaction).toHaveBeenCalled();
    });

    it('propagates errors from gaslessManager.sendTransaction', async () => {
        const { appKit, sendTransaction } = makeAppKit(wallet);
        sendTransaction.mockRejectedValueOnce(new Error('relayer offline'));

        await expect(sendGaslessTransaction(appKit, { quote: makeQuote() })).rejects.toThrow('relayer offline');
    });
});
