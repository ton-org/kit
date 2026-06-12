/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@demo/wallet-core';
import type { NetworkType } from '@demo/wallet-core';

import { CenteredScreen } from '@/core/components/shared/centered-screen';
import { Button } from '@/core/components/ui/button';
import { Segmented } from '@/core/components/ui/segmented';
import type { SegmentedOption } from '@/core/components/ui/segmented';
import { NetworkSelector } from '@/features/wallets';
import { useTonWallet } from '@/core/hooks';
import {
    applyMnemonicPaste,
    evaluateBip39Slots,
    extractMnemonicWordsFromPaste,
    isImportableBip39,
} from '@/features/wallets';

type WalletVersion = 'v5r1' | 'v4r2';
type WalletInterface = 'mnemonic' | 'signer';

const TOTAL_WORDS = 24;
const VERSIONS: SegmentedOption<WalletVersion>[] = [
    { value: 'v5r1', label: 'V5R1', testId: 'version-select-v5r1' },
    { value: 'v4r2', label: 'V4R2', testId: 'version-select-v4r2' },
];
const INTERFACES: SegmentedOption<WalletInterface>[] = [
    { value: 'mnemonic', label: 'Mnemonic', testId: 'interface-select-mnemonic' },
    { value: 'signer', label: 'Signer', testId: 'interface-select-signer' },
];

/** Dedicated "Recovery phrase" screen for importing an existing wallet via mnemonic. */
export const ImportWalletScreen: React.FC = () => {
    const navigate = useNavigate();
    const { importWallet } = useTonWallet();
    const { setUseWalletInterfaceType } = useAuth();

    const [words, setWords] = useState<string[]>(Array(TOTAL_WORDS).fill(''));
    const [activeInput, setActiveInput] = useState(0);
    const [version, setVersion] = useState<WalletVersion>('v5r1');
    const [interfaceType, setInterfaceType] = useState<WalletInterface>('mnemonic');
    const [network, setNetwork] = useState<NetworkType>('mainnet');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const focusCell = (index: number) => {
        setTimeout(() => inputRefs.current[index]?.focus(), 0);
    };

    const handleWordChange = (index: number, value: string) => {
        const cleanValue = value.toLowerCase().replace(/[^a-z]/g, '');
        setWords((prev) => {
            const next = [...prev];
            next[index] = cleanValue;
            return next;
        });
    };

    const validation = useMemo(() => evaluateBip39Slots(words), [words]);
    const isValid = isImportableBip39(validation);

    const handleSubmit = async () => {
        if (!isValid) return;
        setError('');
        setIsLoading(true);
        try {
            setUseWalletInterfaceType(interfaceType);
            await importWallet(validation.nonEmptyWords, version, network);
            navigate('/wallet');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to import wallet');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (index: number, event: React.KeyboardEvent) => {
        const isFirst = index === 0;
        const isLast = index === TOTAL_WORDS - 1;
        const value = inputRefs.current[index]?.value ?? '';

        switch (event.key) {
            case 'Backspace':
                if (value.length === 0 && !isFirst) {
                    const prev = inputRefs.current[index - 1];
                    if (prev) {
                        prev.focus();
                        const end = prev.value.length;
                        prev.setSelectionRange(end, end);
                    }
                }
                return;
            case 'Enter':
                event.preventDefault();
                if (isLast) void handleSubmit();
                else inputRefs.current[index + 1]?.focus();
                return;
            case 'ArrowLeft':
                if (!isFirst) inputRefs.current[index - 1]?.focus();
                return;
            case 'ArrowRight':
                if (!isLast) inputRefs.current[index + 1]?.focus();
                return;
            case ' ':
                if (!isLast && value.length > 0) {
                    event.preventDefault();
                    inputRefs.current[index + 1]?.focus();
                }
                return;
        }
    };

    const handlePaste = (index: number, event: React.ClipboardEvent) => {
        const text = event.clipboardData.getData('text/plain') || event.clipboardData.getData('text');
        const tokens = extractMnemonicWordsFromPaste(text);

        if (tokens.length === 0) {
            if (text.trim().length > 0) {
                event.preventDefault();
                handleWordChange(index, text);
            }
            return;
        }

        event.preventDefault();
        const { nextWords, focusIndex } = applyMnemonicPaste(words, index, tokens);
        setWords(nextWords);
        focusCell(focusIndex);
    };

    const handleClickPaste = () => {
        void navigator.clipboard
            ?.readText()
            .then((text) => {
                const tokens = extractMnemonicWordsFromPaste(text ?? '');
                if (tokens.length < 12) return;
                const { nextWords, focusIndex } = applyMnemonicPaste(words, 0, tokens);
                setWords(nextWords);
                focusCell(focusIndex);
            })
            .catch(() => {
                /* Clipboard API missing or denied; user can still Ctrl+V into a cell. */
            });
    };

    const clearAll = () => {
        setWords(Array(TOTAL_WORDS).fill(''));
        inputRefs.current[0]?.focus();
    };

    const cellClassName = (index: number) => {
        if (validation.invalidIndices.includes(index)) return 'border-red-400 bg-red-50 text-red-900';
        if (words[index]) return 'border-green-300 bg-green-50 text-green-800';
        if (activeInput === index) return 'border-blue-300 bg-blue-50';
        return 'border-gray-300 bg-white';
    };

    const footer = (
        <Button fullWidth onClick={handleSubmit} disabled={!isValid || isLoading} data-testid="import-wallet-process">
            Continue
        </Button>
    );

    return (
        <CenteredScreen onBack={() => navigate(-1)} footer={footer}>
            <div className="px-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Recovery phrase</h1>
                    <p className="mt-2 text-base text-gray-500">Enter the 12 or 24 words of your recovery phrase.</p>
                </div>

                <div className="mt-4 space-y-2">
                    <NetworkSelector value={network} onChange={setNetwork} compact />
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Version</span>
                        <Segmented value={version} onChange={setVersion} options={VERSIONS} />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Interface</span>
                        <Segmented value={interfaceType} onChange={setInterfaceType} options={INTERFACES} />
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-gray-500" data-testid="word-count">
                        {validation.nonEmptyWords.length}/24 words
                    </span>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={clearAll}
                            className="text-xs text-gray-500 hover:text-gray-700"
                            data-testid="clear-mnemonic"
                        >
                            Clear
                        </button>
                        <button
                            type="button"
                            onClick={handleClickPaste}
                            className="text-xs text-blue-600 hover:text-blue-800"
                            data-testid="paste-mnemonic"
                        >
                            Paste
                        </button>
                    </div>
                </div>

                <div className="mt-3 grid grid-cols-4 gap-1.5">
                    {words.map((word, index) => (
                        <div key={index} className="relative">
                            <input
                                ref={(el) => {
                                    inputRefs.current[index] = el;
                                }}
                                type="text"
                                data-testid={`mnemonic-input-${index}`}
                                value={word}
                                onChange={(e) => handleWordChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={(e) => handlePaste(index, e)}
                                onFocus={() => setActiveInput(index)}
                                placeholder={`${index + 1}`}
                                className={`w-full px-1.5 py-1.5 text-xs border rounded text-center font-mono transition-colors ${cellClassName(index)} focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                                autoComplete="off"
                                spellCheck={false}
                            />
                            <span className="absolute -top-1 left-0.5 text-[10px] text-gray-400 bg-white px-0.5">
                                {index + 1}
                            </span>
                        </div>
                    ))}
                </div>

                {error && <p className="mt-4 text-center text-sm text-red-500">{error}</p>}
            </div>
        </CenteredScreen>
    );
};
