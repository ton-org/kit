/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useMemo, useState } from 'react';
import { Network } from '@ton/appkit';
import { Button, Input, Select } from '@ton/appkit-react';
import { useSmartAccountAddress } from '@ton/appkit-react/cross-chain';
import { Copy, ExternalLink, ChevronDownIcon, LayoutGrid } from 'lucide-react';
import { Skeleton } from '@ton/appkit-react';
import { useNetwork } from '@ton/appkit-react';

import { TacAddressInput, isTacAddressValid } from './tac-address-input';

const APPS = [
    {
        name: 'Orbs',
        address: '0xaD809718714905344669E2C5150a33b21c35C53E',
        logo: 'https://assets.coingecko.com/coins/images/4630/standard/Orbs.jpg?1696505200',
    },
    {
        name: 'Merkl',
        address: '0x74e6b5e701bA5de3245653d72A075c7709EeFDC4',
        logo: 'https://raw.githubusercontent.com/AngleProtocol/angle-token-list/refs/heads/main/src/assets/protocols/merkl.svg',
    },
    {
        name: 'Euler',
        address: '0xDD9722bd6874167Ee2b5b4062cf65d0C5Cdb2280',
        logo: 'https://raw.githubusercontent.com/AngleProtocol/angle-token-list/refs/heads/main/src/assets/tokens/EUL.svg',
    },
];

export const SmartAccount: React.FC = () => {
    const [selectedAppId, setSelectedAppId] = useState(APPS[0].address);
    const [customAppAddress, setCustomAppAddress] = useState('');
    const network = useNetwork();

    const appAddress = selectedAppId === 'custom' ? customAppAddress : selectedAppId;
    const isAppAddressValid = isTacAddressValid(appAddress);

    const { address: smartAccountAddress, isLoading: isAddressLoading } = useSmartAccountAddress({
        applicationAddress: isAppAddressValid ? appAddress : '',
        providerId: 'tac',
    });

    const explorerLink = useMemo(() => {
        if (!smartAccountAddress) {
            return undefined;
        }
        if (network?.chainId === Network.testnet().chainId) {
            return `https://spb.explorer.tac.build/address/${smartAccountAddress}`;
        }
        return `https://explorer.tac.build/address/${smartAccountAddress}`;
    }, [smartAccountAddress]);

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            // Fail silently
        }
    };

    return (
        <div className="mx-auto flex w-full max-w-[480px] flex-col gap-4">
            <div className="flex flex-col gap-4">
                <Input.Container className="flex flex-row! justify-between">
                    <Input.Header>
                        <Input.Title>Select dApp</Input.Title>
                    </Input.Header>
                    <Select.Root value={selectedAppId} onValueChange={setSelectedAppId}>
                        <Select.Trigger variant="gray" size="s" borderRadius="l" className="flex items-center gap-2">
                            {selectedAppId === 'custom' ? (
                                <LayoutGrid size={16} className="text-tertiary-foreground" />
                            ) : (
                                <img
                                    src={APPS.find((a) => a.address === selectedAppId)?.logo}
                                    className="size-5 rounded-full"
                                    alt=""
                                />
                            )}
                            <span className="text-base">
                                {selectedAppId === 'custom'
                                    ? 'Custom'
                                    : APPS.find((a) => a.address === selectedAppId)?.name}
                            </span>
                            <ChevronDownIcon size={16} className="opacity-50" />
                        </Select.Trigger>
                        <Select.Content>
                            {APPS.map((app) => (
                                <Select.Item key={app.address} value={app.address} className="flex items-center gap-2">
                                    <img src={app.logo} className="size-5 rounded-full" alt="" />
                                    {app.name}
                                </Select.Item>
                            ))}
                            <Select.Item value="custom" className="flex items-center gap-2">
                                <LayoutGrid size={16} className="text-tertiary-foreground" />
                                Custom
                            </Select.Item>
                        </Select.Content>
                    </Select.Root>
                </Input.Container>

                {selectedAppId === 'custom' && (
                    <TacAddressInput
                        label="Custom App Address (EVM)"
                        name="tac-smart-account-custom-address"
                        value={customAppAddress}
                        onChange={setCustomAppAddress}
                    />
                )}

                <Input.Container>
                    <Input.Header>
                        <Input.Title>Your Smart Account Address</Input.Title>
                    </Input.Header>
                    <Input.Field>
                        <div className="flex w-full items-center justify-between gap-3">
                            {isAddressLoading ? (
                                <Skeleton height={32} style={{ flex: '0.8' }} />
                            ) : (
                                <span className="truncate font-mono text-sm font-medium">
                                    {(smartAccountAddress as string) || '—'}
                                </span>
                            )}

                            <div className="flex gap-1.5">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="size-8 rounded-lg"
                                    onClick={() => copyToClipboard(smartAccountAddress as string)}
                                >
                                    <Copy size={14} />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="size-8 rounded-lg"
                                    disabled={!explorerLink}
                                    onClick={() => window.open(explorerLink, '_blank')}
                                >
                                    <ExternalLink size={14} />
                                </Button>
                            </div>
                        </div>
                    </Input.Field>
                </Input.Container>
            </div>
        </div>
    );
};
