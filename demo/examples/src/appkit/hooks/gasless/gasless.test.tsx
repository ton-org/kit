/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import * as AppKitReact from '@ton/appkit-react';

import { UseGaslessProvidersExample } from './use-gasless-providers';
import { UseGaslessProviderExample } from './use-gasless-provider';
import { UseGaslessProviderMetadataExample } from './use-gasless-provider-metadata';
import { UseGaslessConfigExample } from './use-gasless-config';
import { UseGaslessQuoteExample } from './use-gasless-quote';
import { UseGaslessJettonTransferQuoteExample } from './use-gasless-jetton-transfer-quote';
import { UseSendGaslessTransactionExample } from './use-send-gasless-transaction';

vi.mock('@ton/appkit-react', async () => {
    const actual = await vi.importActual('@ton/appkit-react');
    return {
        ...actual,
        useGaslessProviders: vi.fn(),
        useGaslessProvider: vi.fn(),
        useGaslessProviderMetadata: vi.fn(),
        useGaslessConfig: vi.fn(),
        useGaslessQuote: vi.fn(),
        useGaslessJettonTransferQuote: vi.fn(),
        useSendGaslessTransaction: vi.fn(),
    };
});

const TEST_ADDRESS = 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs';

describe('Gasless Hooks Examples', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    describe('UseGaslessProvidersExample', () => {
        it('renders the list of provider ids', () => {
            vi.mocked(AppKitReact.useGaslessProviders).mockReturnValue([
                { providerId: 'tonapi' },
            ] as unknown as AppKitReact.UseGaslessProvidersReturnType);

            render(<UseGaslessProvidersExample />);
            expect(screen.getByText('tonapi')).toBeDefined();
        });
    });

    describe('UseGaslessProviderExample', () => {
        it('renders the current provider id', () => {
            vi.mocked(AppKitReact.useGaslessProvider).mockReturnValue([
                { providerId: 'tonapi' },
                vi.fn(),
            ] as unknown as AppKitReact.UseGaslessProviderReturnType);

            render(<UseGaslessProviderExample />);
            expect(screen.getByText('Current: tonapi')).toBeDefined();
        });
    });

    describe('UseGaslessProviderMetadataExample', () => {
        it('renders loading state', () => {
            // @ts-expect-error - mock
            vi.mocked(AppKitReact.useGaslessProviderMetadata).mockReturnValue({
                isLoading: true,
                data: undefined,
            });

            render(<UseGaslessProviderMetadataExample />);
            expect(screen.getByText('Loading provider...')).toBeDefined();
        });

        it('renders provider name and url', () => {
            // @ts-expect-error - mock
            vi.mocked(AppKitReact.useGaslessProviderMetadata).mockReturnValue({
                isLoading: false,
                data: { name: 'TonAPI', url: 'https://tonapi.io' },
            });

            render(<UseGaslessProviderMetadataExample />);
            const link = screen.getByText('TonAPI');
            expect(link).toBeDefined();
            expect(link.closest('a')?.getAttribute('href')).toBe('https://tonapi.io');
        });
    });

    describe('UseGaslessConfigExample', () => {
        it('renders loading state', () => {
            // @ts-expect-error - mock
            vi.mocked(AppKitReact.useGaslessConfig).mockReturnValue({
                isLoading: true,
                data: undefined,
            });

            render(<UseGaslessConfigExample />);
            expect(screen.getByText('Loading gasless config...')).toBeDefined();
        });

        it('renders relay address and supported asset options', () => {
            // @ts-expect-error - mock
            vi.mocked(AppKitReact.useGaslessConfig).mockReturnValue({
                isLoading: false,
                data: { relayAddress: TEST_ADDRESS, supportedAssets: [{ address: TEST_ADDRESS }] },
            });

            render(<UseGaslessConfigExample />);
            expect(screen.getByText(`Relay: ${TEST_ADDRESS}`)).toBeDefined();
            expect(screen.getByRole('option', { name: TEST_ADDRESS })).toBeDefined();
        });
    });

    describe('UseGaslessQuoteExample', () => {
        it('renders loading state', () => {
            // @ts-expect-error - mock
            vi.mocked(AppKitReact.useGaslessQuote).mockReturnValue({
                isFetching: true,
                data: undefined,
            });

            render(<UseGaslessQuoteExample />);
            expect(screen.getByText('Quoting...')).toBeDefined();
        });

        it('renders quote fee', () => {
            // @ts-expect-error - mock
            vi.mocked(AppKitReact.useGaslessQuote).mockReturnValue({
                isFetching: false,
                data: { fee: '1234', validUntil: 1735680000 },
            });

            render(<UseGaslessQuoteExample />);
            expect(screen.getByText('Fee: 1234')).toBeDefined();
        });
    });

    describe('UseGaslessJettonTransferQuoteExample', () => {
        it('renders the quote fee and sends on click', async () => {
            const mockQuote = { fee: '1234', validUntil: 1735680000 };
            const mockSend = vi.fn().mockResolvedValue({});

            // @ts-expect-error - mock
            vi.mocked(AppKitReact.useGaslessJettonTransferQuote).mockReturnValue({
                data: mockQuote,
                isFetching: false,
            });
            // @ts-expect-error - mock
            vi.mocked(AppKitReact.useSendGaslessTransaction).mockReturnValue({
                mutateAsync: mockSend,
                isPending: false,
            });

            const { getByText } = render(<UseGaslessJettonTransferQuoteExample />);
            expect(getByText('Fee: 1234')).toBeDefined();

            fireEvent.click(getByText('Send'));
            await waitFor(() => {
                expect(mockSend).toHaveBeenCalledWith({ quote: mockQuote });
            });
        });
    });

    describe('UseSendGaslessTransactionExample', () => {
        it('calls sendGasless on click and logs result', async () => {
            const mockQuote = { fee: '1234', validUntil: 1735680000 };
            const mockSend = vi.fn().mockResolvedValue({
                internalBoc: 'AAA=',
                normalizedHash: '0x' + 'a'.repeat(64),
            });
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

            // @ts-expect-error - mock
            vi.mocked(AppKitReact.useGaslessQuote).mockReturnValue({
                data: mockQuote,
                isFetching: false,
            });

            // @ts-expect-error - mock
            vi.mocked(AppKitReact.useSendGaslessTransaction).mockReturnValue({
                mutateAsync: mockSend,
                isPending: false,
            });

            render(<UseSendGaslessTransactionExample />);
            fireEvent.click(screen.getByText('Send Gasless'));

            await waitFor(() => {
                expect(mockSend).toHaveBeenCalledWith({ quote: mockQuote });
            });

            consoleSpy.mockRestore();
        });

        it('disables the button while pending', () => {
            // @ts-expect-error - mock
            vi.mocked(AppKitReact.useGaslessQuote).mockReturnValue({
                data: { fee: '1234', validUntil: 1735680000 },
                isFetching: false,
            });

            // @ts-expect-error - mock
            vi.mocked(AppKitReact.useSendGaslessTransaction).mockReturnValue({
                mutateAsync: vi.fn(),
                isPending: true,
            });

            render(<UseSendGaslessTransactionExample />);
            const button = screen.getByText('Sending...');
            expect(button.closest('button')?.disabled).toBe(true);
        });
    });
});
