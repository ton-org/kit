/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AppKit } from '@ton/appkit';
import type { WalletInterface } from '@ton/appkit';
import { Network } from '@ton/walletkit';

import { gaslessExample } from './gasless-actions';

const TEST_ADDRESS = 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs';
const SIGN_MESSAGE_FEATURE = { name: 'SignMessage', maxMessages: 4 } as const;

describe('Gasless Actions Examples', () => {
    let appKit: AppKit;
    let consoleSpy: ReturnType<typeof vi.spyOn>;
    let mockGetMetadata: ReturnType<typeof vi.fn>;
    let mockGetSupportedAssets: ReturnType<typeof vi.fn>;
    let mockGetQuote: ReturnType<typeof vi.fn>;
    let mockSend: ReturnType<typeof vi.fn>;
    let mockSignMessage: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.clearAllMocks();
        consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        appKit = new AppKit({
            networks: {
                [Network.mainnet().chainId]: {},
            },
        });

        mockGetMetadata = vi.fn().mockResolvedValue({ name: 'TonAPI', url: 'https://tonapi.io' });
        mockGetSupportedAssets = vi.fn().mockResolvedValue([{ address: TEST_ADDRESS }]);
        mockGetQuote = vi.fn().mockResolvedValue({
            messages: [{ address: TEST_ADDRESS, amount: '60000000' }],
            fee: '1234',
            validUntil: Math.floor(Date.now() / 1000) + 120,
            from: TEST_ADDRESS,
        });
        mockSend = vi.fn().mockResolvedValue({
            boc: 'AAA=',
            normalizedBoc: 'AAA=',
            normalizedHash: '0x' + 'a'.repeat(64),
            internalBoc: 'AAAA',
        });
        mockSignMessage = vi.fn().mockResolvedValue({ internalBoc: 'AAAA' });

        // @ts-expect-error - internal mock access
        vi.spyOn(appKit.gaslessManager, 'getProvider').mockImplementation((id) => ({
            providerId: id || 'default',
        }));
        vi.spyOn(appKit.gaslessManager, 'getProviders').mockReturnValue([]);
        // @ts-expect-error - internal mock access
        vi.spyOn(appKit.gaslessManager, 'getMetadata').mockImplementation(mockGetMetadata);
        // @ts-expect-error - internal mock access
        vi.spyOn(appKit.gaslessManager, 'getSupportedAssets').mockImplementation(mockGetSupportedAssets);
        // @ts-expect-error - internal mock access
        vi.spyOn(appKit.gaslessManager, 'getQuote').mockImplementation(mockGetQuote);
        // @ts-expect-error - internal mock access
        vi.spyOn(appKit.gaslessManager, 'sendTransaction').mockImplementation(mockSend);
        vi.spyOn(appKit.gaslessManager, 'setDefaultProvider').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    const setupMockWallet = () => {
        const wallet = {
            connectorId: 'mock',
            getAddress: () => TEST_ADDRESS,
            getPublicKey: () => '0xabc',
            getNetwork: () => Network.mainnet(),
            getWalletId: () => 'mock-wallet-id',
            getSupportedFeatures: () => [SIGN_MESSAGE_FEATURE],
            sendTransaction: vi.fn(),
            signData: vi.fn(),
            signMessage: mockSignMessage,
        } as unknown as WalletInterface;

        appKit.walletsManager.setWallets([wallet]);
        return wallet;
    };

    it('runs the full gasless example flow', async () => {
        setupMockWallet();

        await gaslessExample(appKit);

        expect(mockGetMetadata).toHaveBeenCalled();
        expect(mockGetSupportedAssets).toHaveBeenCalled();
        expect(mockGetQuote).toHaveBeenCalled();
        expect(mockSignMessage).toHaveBeenCalled();
        expect(mockSend).toHaveBeenCalled();
    });
});
