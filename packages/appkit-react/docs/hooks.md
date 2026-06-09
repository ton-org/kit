# Hooks

AppKit React provides a set of hooks to interact with the blockchain and wallets.

## Core
 
 ### `useAppKit`
 
 Hook to access the `AppKit` instance.
 
 ```ts
const appKit = useAppKit();
```
 
 ### `useAppKitTheme`
 
 Hook to access and toggle the current theme.
 
 ```tsx
const [theme, setTheme] = useAppKitTheme();

return (
    <div>
        <h3>Current Theme: {theme}</h3>
        <button onClick={() => setTheme('dark')}>Set Dark Theme</button>
        <button onClick={() => setTheme('light')}>Set Light Theme</button>
    </div>
);
```
 
 ## Balances

### `useBalance`

Hook to get the TON balance of the currently selected wallet.

```tsx
const { data: balance, isLoading, error } = useBalance();

if (isLoading) {
    return <div>Loading...</div>;
}

if (error) {
    return <div>Error: {error.message}</div>;
}

return <div>Balance: {balance?.toString()}</div>;
```

### `useBalanceByAddress`

Hook to fetch the TON balance of a specific address.

```tsx
const {
    data: balance,
    isLoading,
    error,
} = useBalanceByAddress({
    address: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
});

if (isLoading) {
    return <div>Loading...</div>;
}

if (error) {
    return <div>Error: {error.message}</div>;
}

return <div>Balance: {balance?.toString()}</div>;
```

### `useWatchBalance`

Hook to enable real-time balance updates for the currently selected wallet. It automatically updates the TanStack Query cache.

```tsx
const { data: balance } = useBalance();

useWatchBalance();

return <div>Current balance: {balance}</div>;
```

### `useWatchBalanceByAddress`

Hook to enable real-time balance updates for a specific address.

```tsx
const address = 'UQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJKZ';
const network = Network.mainnet();
const { data: balance } = useBalanceByAddress({ address, network });

useWatchBalanceByAddress({ address, network });

return <div>Current balance: {balance}</div>;
```

## Jettons

### `useJettons`

Hook to get all jettons owned by the currently selected wallet.

```tsx
const { data: jettons, isLoading, error } = useJettons();

if (isLoading) {
    return <div>Loading...</div>;
}

if (error) {
    return <div>Error: {error.message}</div>;
}

return (
    <div>
        <h3>Jettons</h3>
        <ul>
            {jettons?.jettons.map((jetton) => (
                <li key={jetton.walletAddress}>
                    {jetton.info.name}: {jetton.balance}
                </li>
            ))}
        </ul>
    </div>
);
```

### `useJettonsByAddress`

Hook to get all jettons owned by a specific address.

```tsx
const {
    data: jettons,
    isLoading,
    error,
} = useJettonsByAddress({
    address: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
});

if (isLoading) {
    return <div>Loading...</div>;
}

if (error) {
    return <div>Error: {error.message}</div>;
}

return (
    <div>
        <h3>Jettons</h3>
        <ul>
            {jettons?.jettons.map((jetton) => (
                <li key={jetton.walletAddress}>
                    {jetton.info.name}: {jetton.balance}
                </li>
            ))}
        </ul>
    </div>
);
```

### `useJettonBalanceByAddress`

Hook to get the balance of a specific jetton for a wallet address.

```tsx
const {
    data: balance,
    isLoading,
    error,
} = useJettonBalanceByAddress({
    ownerAddress: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
    jettonAddress: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiXme1Xc56Iwobkzgnjj',
});

if (isLoading) {
    return <div>Loading...</div>;
}

if (error) {
    return <div>Error: {error.message}</div>;
}

return <div>Jetton Balance: {balance}</div>;
```

### `useJettonInfo`

Hook to get information about a specific jetton by its address.

```tsx
const {
    data: info,
    isLoading,
    error,
} = useJettonInfo({
    address: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiXme1Xc56Iwobkzgnjj',
});

if (isLoading) {
    return <div>Loading...</div>;
}

if (error) {
    return <div>Error: {error.message}</div>;
}

return (
    <div>
        <h3>Jetton Info</h3>
        <p>Name: {info?.name}</p>
        <p>Symbol: {info?.symbol}</p>
        <p>Decimals: {info?.decimals}</p>
    </div>
);
```

### `useJettonWalletAddress`

Hook to get the jetton wallet address for a specific jetton and owner address.

```tsx
const {
    data: walletAddress,
    isLoading,
    error,
} = useJettonWalletAddress({
    ownerAddress: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
    jettonAddress: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiXme1Xc56Iwobkzgnjj',
});

if (isLoading) {
    return <div>Loading...</div>;
}

if (error) {
    return <div>Error: {error.message}</div>;
}

return <div>Jetton Wallet Address: {walletAddress?.toString()}</div>;
```

### `useTransferJetton`

Hook to transfer jettons to a recipient address.

```tsx
const { mutate: transfer, isPending, error } = useTransferJetton();

const handleTransfer = () => {
    transfer({
        recipientAddress: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
        amount: '100', // 100 USDT
        jettonAddress: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
    });
};

return (
    <div>
        <button onClick={handleTransfer} disabled={isPending}>
            {isPending ? 'Transferring...' : 'Transfer Jetton'}
        </button>
        {error && <div>Error: {error.message}</div>}
    </div>
);
```

### `useWatchJettons`

Hook to enable real-time jetton updates for the currently selected wallet.

```tsx
const { data: jettons } = useJettons();

useWatchJettons();

return (
    <div>
        <h3>Your Jettons:</h3>
        <ul>
            {jettons?.jettons.map((j) => (
                <li key={j.walletAddress}>
                    {j.info.name}: {j.balance}
                </li>
            ))}
        </ul>
    </div>
);
```

### `useWatchJettonsByAddress`

Hook to enable real-time jetton updates for a specific address.

```tsx
const address = 'UQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJKZ';
const { data: jettons } = useJettonsByAddress({ address });

useWatchJettonsByAddress({ address });

return (
    <div>
        <h3>Jettons for {address}:</h3>
        <ul>
            {jettons?.jettons.map((j) => (
                <li key={j.walletAddress}>
                    {j.info.name}: {j.balance}
                </li>
            ))}
        </ul>
    </div>
);
```

## Network

### `useNetwork`

Hook to get network of the selected wallet.

```tsx
const network = useNetwork();

if (!network) {
    return <div>Network not selected</div>;
}

return <div>Current Network: {network.chainId}</div>;
```

### `useNetworks`

Hook to get all configured networks.

```tsx
const networks = useNetworks();

return (
    <div>
        <h3>Available Networks</h3>
        <ul>
            {networks.map((network) => (
                <li key={network.chainId}>{network.chainId}</li>
            ))}
        </ul>
    </div>
);
```

### `useBlockNumber`

Hook to get the current masterchain block number.

```tsx
const { data: blockNumber } = useBlockNumber();

return <div>Current block number: {blockNumber}</div>;
```

### `useDefaultNetwork`

Hook to get and set the default network for wallet connections. Returns a tuple `[defaultNetwork, setDefaultNetwork]`.

```tsx
const [defaultNetwork, setDefaultNetwork] = useDefaultNetwork();

return (
    <div>
        <p>Default network: {defaultNetwork?.chainId ?? 'Any'}</p>
        <button onClick={() => setDefaultNetwork(Network.testnet())}>Use Testnet</button>
        <button onClick={() => setDefaultNetwork(undefined)}>Any Network</button>
    </div>
);
```

## NFT

### `useNft`

Hook to get a single NFT.

```tsx
const {
    data: nft,
    isLoading,
    error,
} = useNft({
    address: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
});

if (isLoading) {
    return <div>Loading...</div>;
}

if (error) {
    return <div>Error: {error.message}</div>;
}

return (
    <div>
        <h3>NFT Details</h3>
        <p>Name: {nft?.info?.name}</p>
        <p>Collection: {nft?.collection?.name}</p>
        <p>Owner: {nft?.ownerAddress?.toString()}</p>
    </div>
);
```

### `useNfts`

Hook to get NFTs of the selected wallet.

```tsx
const {
    data: nfts,
    isLoading,
    error,
} = useNfts({
    limit: 10,
});

if (isLoading) {
    return <div>Loading...</div>;
}

if (error) {
    return <div>Error: {error.message}</div>;
}

return (
    <div>
        <h3>My NFTs</h3>
        <ul>
            {nfts?.nfts.map((nft) => (
                <li key={nft.address.toString()}>
                    {nft.info?.name} ({nft.collection?.name})
                </li>
            ))}
        </ul>
    </div>
);
```

### `useNftsByAddress`

Hook to get NFTs of a specific address.

```tsx
const {
    data: nfts,
    isLoading,
    error,
} = useNftsByAddress({
    address: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
    limit: 10,
});

if (isLoading) {
    return <div>Loading...</div>;
}

if (error) {
    return <div>Error: {error.message}</div>;
}

return (
    <div>
        <h3>NFTs</h3>
        <ul>
            {nfts?.nfts.map((nft) => (
                <li key={nft.address.toString()}>
                    {nft.info?.name} ({nft.collection?.name})
                </li>
            ))}
        </ul>
    </div>
);
```

### `useTransferNft`

Hook to transfer NFT to another wallet.

```tsx
const { mutate: transfer, isPending, error } = useTransferNft();

const handleTransfer = () => {
    transfer({
        nftAddress: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
        recipientAddress: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
        comment: 'Gift for you',
    });
};

return (
    <div>
        <button onClick={handleTransfer} disabled={isPending}>
            {isPending ? 'Transferring...' : 'Transfer NFT'}
        </button>
        {error && <div>Error: {error.message}</div>}
    </div>
);
```

## Signing

### `useSignBinary`

Hook to sign binary data with the connected wallet.

```tsx
const { mutate: signBinary, isPending, error, data } = useSignBinary();

const handleSign = () => {
    // Sign "Hello" in binary (Base64: SGVsbG8=)
    signBinary({ bytes: 'SGVsbG8=' as Base64String });
};

return (
    <div>
        <button onClick={handleSign} disabled={isPending}>
            {isPending ? 'Signing...' : 'Sign Binary'}
        </button>
        {error && <div>Error: {error.message}</div>}
        {data && (
            <div>
                <h4>Signature:</h4>
                <pre>{data.signature}</pre>
            </div>
        )}
    </div>
);
```

### `useSignCell`

Hook to sign TON Cell data with the connected wallet.

```tsx
const { mutate: signCell, isPending, error, data } = useSignCell();

const handleSign = () => {
    signCell({
        cell: 'te6cckEBAQEAAgAAAEysuc0=' as Base64String, // Empty cell
        schema: 'nothing#0 = Nothing',
    });
};

return (
    <div>
        <button onClick={handleSign} disabled={isPending}>
            {isPending ? 'Signing...' : 'Sign Cell'}
        </button>
        {error && <div>Error: {error.message}</div>}
        {data && (
            <div>
                <h4>Signature:</h4>
                <pre>{data.signature}</pre>
            </div>
        )}
    </div>
);
```

### `useSignText`

Hook to sign text messages with the connected wallet.

```tsx
const { mutate: signText, isPending, error, data } = useSignText();

const handleSign = () => {
    signText({ text: 'Hello, TON!' });
};

return (
    <div>
        <button onClick={handleSign} disabled={isPending}>
            {isPending ? 'Signing...' : 'Sign Text'}
        </button>
        {error && <div>Error: {error.message}</div>}
        {data && (
            <div>
                <h4>Signature:</h4>
                <pre>{data.signature}</pre>
            </div>
        )}
    </div>
);
```

## Swap

### `useSwapQuote`

Hook to get a swap quote for a token pair.

```tsx
const {
    data: quote,
    isLoading,
    error,
} = useSwapQuote({
    from: { address: 'ton', decimals: 9 },
    to: {
        address: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
        decimals: 6,
    }, // USDT
    amount: '1', // human-readable amount as string
});

if (isLoading) {
    return <div>Loading quote...</div>;
}

if (error) {
    return <div>Error: {error.message}</div>;
}

return (
    <div>
        <h3>Swap Quote</h3>
        {quote && (
            <div>
                <p>Expected Output: {quote.toAmount}</p>
                <p>Price Impact: {quote.priceImpact}</p>
            </div>
        )}
    </div>
);
```

### `useBuildSwapTransaction`

Hook to build a transaction for a swap operation based on a quote.

```tsx
// First, get a quote
const { data: quote } = useSwapQuote({
    from: { address: 'ton', decimals: 9 },
    to: {
        address: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
        decimals: 6,
    },
    amount: '1', // human-readable amount as string
    network: Network.mainnet(),
});

// Valid only for building the transaction
const { mutateAsync: buildTx, isPending: isBuilding } = useBuildSwapTransaction();

// Valid for sending the transaction
const { mutateAsync: sendTx, isPending: isSending } = useSendTransaction();

const handleSwap = async () => {
    if (!quote) {
        return;
    }

    try {
        // Build the transaction
        const transaction = await buildTx({
            quote,
            userAddress: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c', // User's wallet address
            slippageBps: 100, // 1%
        });

        // Send the transaction
        await sendTx(transaction);
    } catch (e) {
        console.error(e);
    }
};

const isPending = isBuilding || isSending;

return (
    <div>
        <button onClick={handleSwap} disabled={!quote || isPending}>
            {isPending ? 'Processing...' : 'Swap'}
        </button>
    </div>
);
```

### `useSwapProvider`

Hook to read and change the currently selected swap provider. Returns a tuple `[provider, setProviderId]` — mirrors `useSelectedWallet`.

```tsx
const [provider, setProviderId] = useSwapProvider();
return (
    <div>
        <div>Result: {provider ? provider.providerId : 'null'}</div>
        <button onClick={() => setProviderId('stonfi')}>Use STON.fi</button>
    </div>
);
```

### `useSwapProviders`

Hook to get all registered swap providers. The returned array keeps a stable reference until the provider list changes, so it is safe to use with `useSyncExternalStore`.

```tsx
const providers = useSwapProviders();
return (
    <ul>
        {providers.map((p) => (
            <li key={p.providerId}>{p.getMetadata().name}</li>
        ))}
    </ul>
);
```

## Staking

### `useStakingProviders`

Hook to get all registered staking providers. The returned array keeps a stable reference until the provider list changes.

```tsx
const providers = useStakingProviders();
return (
    <ul>
        {providers.map((p) => (
            <li key={p.providerId}>{p.providerId}</li>
        ))}
    </ul>
);
```

### `useStakingProvider`

Hook to get a specific staking provider by id (or the default when no id is passed).

```tsx
const provider = useStakingProvider({ id: 'tonstakers' });
return <div>Result: {provider ? provider.providerId : 'null'}</div>;
```

### `useStakingQuote`

Hook to get a quote for staking or unstaking a given amount.

```tsx
const {
    data: quote,
    isLoading,
    error,
} = useStakingQuote({
    amount: '10',
    direction: 'stake',
});

if (isLoading) return <div>Loading quote...</div>;
if (error) return <div>Error: {error.message}</div>;

return <div>Expected Output: {quote?.amountOut}</div>;
```

### `useStakedBalance`

Hook to get the user's currently staked balance.

```tsx
const { data: balance, isLoading } = useStakedBalance({
    userAddress: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
});

if (isLoading) return <div>Loading balance...</div>;

return <div>Staked Balance: {balance?.stakedBalance}</div>;
```

### `useStakingProviderInfo`

Hook to get live info about a staking provider (APY, limits, etc.).

```tsx
const { data: info, isLoading } = useStakingProviderInfo({
    providerId: 'tonstakers',
});

if (isLoading) return <div>Loading info...</div>;

return <div>APY: {info?.apy}</div>;
```

### `useStakingProviderMetadata`

Hook to get static metadata about a staking provider (name, receive token, etc.).

```tsx
const metadata = useStakingProviderMetadata();
return <div>Receive Token: {metadata?.receiveToken?.ticker}</div>;
```

### `useBuildStakeTransaction`

Hook to build a stake transaction from a previously fetched quote.

```tsx
const { data: quote } = useStakingQuote({
    amount: '10',
    direction: 'stake',
});

const { mutateAsync: buildTx, isPending: isBuilding } = useBuildStakeTransaction();
const { mutateAsync: sendTx, isPending: isSending } = useSendTransaction();

const handleStake = async () => {
    if (!quote) return;
    try {
        const transaction = await buildTx({
            quote,
            userAddress: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
        });
        await sendTx(transaction);
    } catch (e) {
        console.error(e);
    }
};

const isPending = isBuilding || isSending;

return (
    <div>
        <button onClick={handleStake} disabled={!quote || isPending}>
            {isPending ? 'Processing...' : 'Stake'}
        </button>
    </div>
);
```

## Gasless

Gasless lets a dApp submit on-chain transactions without the user holding TON for gas: a relayer co-signs and broadcasts the transaction, charging the user a fee in a relayer-accepted asset (e.g. USDT). The connected wallet must support the `SignMessage` TonConnect feature. See the [gasless guide](https://github.com/ton-connect/kit/blob/main/packages/appkit/docs/gasless.md) for a regular-send → gasless-send migration.

### `useGaslessProviders`

Hook to get all registered gasless providers.

```tsx
const providers = useGaslessProviders();
return (
    <ul>
        {providers.map((p) => (
            <li key={p.providerId}>{p.providerId}</li>
        ))}
    </ul>
);
```

### `useGaslessProvider`

Hook to get the current default gasless provider and a setter to switch the default.

```tsx
const [provider, setProviderId] = useGaslessProvider();
return (
    <div>
        <div>Current: {provider?.providerId ?? 'none'}</div>
        <button onClick={() => setProviderId('tonapi')}>Use TonApi</button>
    </div>
);
```

### `useGaslessProviderMetadata`

Hook to fetch static metadata (display name, logo, url) for a gasless provider.

```tsx
const { data: metadata, isLoading } = useGaslessProviderMetadata();

if (isLoading) return <div>Loading provider...</div>;
if (!metadata) return null;

return (
    <a href={metadata.url} target="_blank" rel="noreferrer">
        {metadata.logo && <img src={metadata.logo} alt="" width={16} height={16} />}
        {metadata.name}
    </a>
);
```

### `useGaslessConfig`

Hook to fetch the gasless relayer's configuration — relay address (e.g. for jetton-transfer `responseDestination`) and accepted fee assets.

```tsx
const { data: config, isLoading } = useGaslessConfig();

if (isLoading) return <div>Loading gasless config...</div>;

return (
    <div>
        <p>Relay: {config?.relayAddress}</p>
        <select>
            {config?.supportedAssets.map((asset) => (
                <option key={asset.address} value={asset.address}>
                    {asset.address}
                </option>
            ))}
        </select>
    </div>
);
```

### `useGaslessQuote`

Hook to fetch a gasless quote. Auto-refetches as inputs change; cached results become stale after ~2 minutes (matches the relayer `validUntil` window). Omit `feeAsset` for free / sponsored providers — jetton-fee providers throw `GaslessError(UNSUPPORTED_OPERATION)` in that case.

```tsx
const { data: quote, isFetching } = useGaslessQuote({
    feeAsset: asAddressFriendly('EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs'), // USDT
    messages: [
        {
            address: 'EQ...jetton_wallet_address',
            amount: '60000000', // 0.06 TON gas budget
            payload: 'te6cckEBAQEAAgAAAA==' as Base64String,
        },
    ],
});

return (
    <div>
        {isFetching && <span>Quoting...</span>}
        {quote && (
            <>
                <div>Fee: {quote.fee}</div>
                <div>Valid until: {new Date(quote.validUntil * 1000).toISOString()}</div>
            </>
        )}
    </div>
);
```

### `useGaslessJettonTransferQuote`

Hook to fetch a gasless quote for a jetton transfer from semantic params (`jettonAddress`, `recipientAddress`, `amount`, `feeAsset`) — no manual message building. Auto-refetches as inputs change and on wallet/network switch.

```tsx
// No manual message building — pass the transfer intent, get a quote back.
const { data: quote, isFetching } = useGaslessJettonTransferQuote({
    jettonAddress: USDT_MASTER,
    recipientAddress: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
    amount: '100',
    feeAsset: asAddressFriendly(USDT_MASTER),
});

const { mutateAsync: sendGasless, isPending } = useSendGaslessTransaction();

return (
    <div>
        {isFetching && <span>Quoting...</span>}
        {quote && (
            <>
                <div>Fee: {quote.fee}</div>
                <button disabled={isPending} onClick={() => sendGasless({ quote })}>
                    Send
                </button>
            </>
        )}
    </div>
);
```

### `useSendGaslessTransaction`

Hook to sign a previously computed quote and submit the resulting BoC to the relayer. Returns a `GaslessSendResponse` (`{ boc, normalizedBoc, normalizedHash, internalBoc }`).

Throws:
- `GaslessError(QUOTE_EXPIRED)` if the quote's `validUntil` window has passed (checked before signing).
- `GaslessError(WALLET_MISMATCH)` if the quote was issued for a different address than the selected wallet.
- `GaslessError(SIGN_MESSAGE_NOT_SUPPORTED)` if the wallet does not advertise `SignMessage`.
- `GaslessError(TOO_MANY_MESSAGES)` if the quote carries more messages than the wallet's `maxMessages` cap.

```tsx
const { data: quote } = useGaslessQuote({
    feeAsset: asAddressFriendly('EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs'),
    messages: [
        {
            address: 'EQ...jetton_wallet_address',
            amount: '60000000',
            payload: 'te6cckEBAQEAAgAAAA==' as Base64String,
        },
    ],
});
const { mutateAsync: sendGasless, isPending } = useSendGaslessTransaction();

const handleSend = async () => {
    if (!quote) return;
    try {
        const { internalBoc, normalizedHash } = await sendGasless({ quote });
        console.log('Submitted. Hash:', normalizedHash, 'BoC:', internalBoc);
    } catch (e) {
        console.error(e);
    }
};

return (
    <button onClick={handleSend} disabled={!quote || isPending}>
        {isPending ? 'Sending...' : 'Send Gasless'}
    </button>
);
```

## Transaction

### `useSendTransaction`

Hook to send a transaction to the blockchain.

```tsx
const { mutate: sendTransaction, isPending, error, data } = useSendTransaction();

const handleSendStructure = () => {
    // Send a transaction with a specific structure
    sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes from now
        messages: [
            {
                address: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
                amount: '1000000000', // 1 TON in nanotons
                payload: 'te6cckEBAQEAAgAAAEysuc0=' as Base64String, // Optional payload (cell)
            },
        ],
    });
};

return (
    <div>
        <button onClick={handleSendStructure} disabled={isPending}>
            {isPending ? 'Sending...' : 'Send Transaction'}
        </button>
        {error && <div>Error: {error.message}</div>}
        {data && (
            <div>
                <h4>Transaction Sent!</h4>
                <p>BOC: {data.boc}</p>
            </div>
        )}
    </div>
);
```

### `useSignMessage`

Hook to sign a transaction-shaped request without broadcasting it. Returns a signed internal-message BoC that can be relayed on-chain by a third party (e.g. a gasless relayer). Requires wallet support for the `SignMessage` feature.

```tsx
const { mutate: signMessage, isPending, error, data } = useSignMessage();

const handleSign = () => {
    signMessage({
        validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes
        messages: [
            {
                address: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
                amount: '100000000', // 0.1 TON in nanotons
            },
        ],
    });
};

return (
    <div>
        <button onClick={handleSign} disabled={isPending}>
            {isPending ? 'Signing...' : 'Sign Message'}
        </button>
        {error && <div>Error: {error.message}</div>}
        {data && (
            <div>
                <h4>Message Signed!</h4>
                <p>Internal BOC: {data.internalBoc}</p>
            </div>
        )}
    </div>
);
```

### `useTransferTon`

Hook to simplify transferring TON to another address.

```tsx
const { mutate: transferTon, isPending, error, data } = useTransferTon();

const handleTransfer = () => {
    transferTon({
        recipientAddress: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
        amount: '1', // 1 TON (human-readable format)
        comment: 'Hello from AppKit!',
    });
};

return (
    <div>
        <button onClick={handleTransfer} disabled={isPending}>
            {isPending ? 'Transferring...' : 'Transfer TON'}
        </button>
        {error && <div>Error: {error.message}</div>}
        {data && (
            <div>
                <h4>Transfer Successful!</h4>
                <p>BOC: {data.boc}</p>
            </div>
        )}
    </div>
);
```

### `useWatchTransactions`

Hook to watch for new transactions for the currently selected wallet in real-time.

```tsx
const [lastUpdate, setLastUpdate] = useState<TransactionsUpdate | null>(null);

useWatchTransactions({
    onChange: (update) => {
        setLastUpdate(update);
    },
});

return (
    <div>
        {lastUpdate ? (
            <div>
                Last update for: {lastUpdate.address}
                <br />
                Transactions count: {lastUpdate.transactions.length}
            </div>
        ) : (
            'Waiting for transactions...'
        )}
    </div>
);
```

### `useWatchTransactionsByAddress`

Hook to watch for new transactions for a specific address in real-time.

```tsx
const address = 'UQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJKZ';
const [lastUpdate, setLastUpdate] = useState<TransactionsUpdate | null>(null);

useWatchTransactionsByAddress({
    address,
    onChange: (update) => {
        setLastUpdate(update);
    },
});

return (
    <div>
        {lastUpdate ? (
            <div>
                New transactions for: {lastUpdate.address}
                <br />
                Count: {lastUpdate.transactions.length}
            </div>
        ) : (
            'Waiting for transactions...'
        )}
    </div>
);
```

## Wallets

### `useAddress`

Hook to get current wallet address.

```tsx
const address = useAddress();

if (!address) {
    return <div>Wallet not connected</div>;
}

return <div>Current Address: {address}</div>;
```

### `useConnect`

Hook to connect a wallet.

```tsx
const [wallet] = useSelectedWallet();
const { mutate: connect, isPending: isConnecting, error: connectError } = useConnect();
const { mutate: disconnect, isPending: isDisconnecting } = useDisconnect();

if (wallet) {
    return (
        <div>
            <button
                onClick={() => {
                    disconnect({ connectorId: wallet.connectorId });
                }}
                disabled={isDisconnecting}
            >
                {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
            </button>
        </div>
    );
}

return (
    <div>
        <button onClick={() => connect({ connectorId: 'tonconnect' })} disabled={isConnecting}>
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
        {connectError && <div>Error: {connectError.message}</div>}
    </div>
);
```

### `useConnectedWallets`

Hook to get all connected wallets.

```tsx
const connectedWallets = useConnectedWallets();

return (
    <div>
        <h3>Connected Wallets:</h3>
        <ul>
            {connectedWallets.map((wallet) => (
                <li key={wallet.getAddress()}>
                    {wallet.getAddress()} ({wallet.getNetwork().toString()})
                </li>
            ))}
        </ul>
    </div>
);
```

### `useConnectorById`

Hook to get a connector by its ID.

```tsx
const connector = useConnectorById('injected');

if (!connector) {
    return <div>Injected connector not found</div>;
}

return (
    <div>
        <h3>Connector Details:</h3>
        <p>ID: {connector.id}</p>
        <p>Type: {connector.type}</p>
    </div>
);
```

### `useConnectors`

Hook to get all available connectors.

```tsx
const connectors = useConnectors();
const { mutate: connect } = useConnect();

return (
    <div>
        <h3>Available Connectors:</h3>
        <ul>
            {connectors.map((connector) => (
                <li key={connector.id}>
                    <button onClick={() => connect({ connectorId: connector.id })}>{connector.type}</button>
                </li>
            ))}
        </ul>
    </div>
);
```

### `useDisconnect`

Hook to disconnect a wallet.

```tsx
const [wallet] = useSelectedWallet();
const { mutate: disconnect, isPending, error } = useDisconnect();

if (!wallet) {
    return <div>Wallet not connected</div>;
}

return (
    <div>
        <p>Connected: {wallet.getAddress()}</p>
        <button
            onClick={() => {
                disconnect({ connectorId: wallet.connectorId });
            }}
            disabled={isPending}
        >
            {isPending ? 'Disconnecting...' : 'Disconnect'}
        </button>
        {error && <div>Error: {error.message}</div>}
    </div>
);
```

### `useSelectedWallet`

Hook to get and set the currently selected wallet.

```tsx
const [wallet, setSelectedWallet] = useSelectedWallet();

return (
    <div>
        {wallet ? (
            <div>
                <p>Current Wallet: {wallet.getAddress()}</p>
                <button onClick={() => setSelectedWallet(null)}>Deselect Wallet</button>
            </div>
        ) : (
            <p>No wallet selected</p>
        )}
    </div>
);
```

### `useSignMessageSupport`

Hook to check whether the selected wallet advertises the `SignMessage` feature (required for gasless). Reactive to wallet selection changes; fail-closed (`false`) when no wallet is selected or features aren't advertised.

```tsx
const hasSignMessageSupport = useSignMessageSupport();

return <p>{hasSignMessageSupport ? 'Wallet supports SignMessage' : 'SignMessage not supported'}</p>;
```

<!--
This file is auto-generated. Do not edit manually.
Changes will be overwritten when running the docs update script.
Source template: template/packages/appkit-react/docs/hooks.md
-->

