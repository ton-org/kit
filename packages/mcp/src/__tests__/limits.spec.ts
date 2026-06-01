/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Address, beginCell } from '@ton/core';
import type { ApiClient, Base64String, Hex, Transaction } from '@ton/walletkit';
import { describe, expect, it, vi } from 'vitest';

import {
    CHANGE_NFT_CONTENT_OP,
    TON_ASSET_KEY,
    assetKeyForAddress,
    computeLimitsHash,
    limitsDictToStored,
    normalizeAssetKey,
    parseLimitsDictFromMessageBody,
    storedToLimitsDict,
} from '../limits/limits-codec.js';
import { evaluateLimits, findLimitViolation, formatLimitViolation, maxRelevantWindow } from '../limits/enforce.js';
import type { LimitsEnv } from '../limits/enforce.js';
import { getJettonWalletInfoFromClient, parseJettonOutflowAmount } from '../limits/jetton.js';
import { sumSpendWithinWindow, transactionsToSpend } from '../limits/spend-window.js';
import type { LimitsDict, PendingSpend, SpendEntry } from '../limits/types.js';
import type { StoredLimits } from '../registry/config.js';
import { McpWalletService } from '../services/McpWalletService.js';

const SENTINEL = new Address(0, Buffer.alloc(32));
const JETTON = new Address(0, Buffer.alloc(32, 7));
const JETTON_KEY = JETTON.toRawString();

const WALLET = new Address(0, Buffer.alloc(32, 1)).toString();
const OTHER = new Address(0, Buffer.alloc(32, 2)).toString();
const RECIPIENT = OTHER;
const JETTON_WALLET = new Address(0, Buffer.alloc(32, 3)).toString();

const JETTON_TRANSFER_OP = 0x0f8a7ea5;
const JETTON_BURN_OP = 0x595f07bc;

const NOW = 1000;

// -------------------------------------------------------------------------------------------------
// limits-codec
// -------------------------------------------------------------------------------------------------

const STORED: StoredLimits = {
    assets: {
        [TON_ASSET_KEY]: { windows: { '0': '5000000000', '3600': '20000000000' } },
        [JETTON.toString()]: { windows: { '86400': '1000' } },
    },
};

/** A ChangeNftContentMsg body carrying `dict` after the (here empty) NFT content. */
function changeContentBody(dict: LimitsDict, op = CHANGE_NFT_CONTENT_OP) {
    return beginCell().storeUint(op, 32).storeUint(1n, 64).storeMaybeRef(null).storeDict(dict).endCell();
}

describe('limits-codec asset keys', () => {
    it('maps the zero address to the TON sentinel and jettons to their master', () => {
        expect(assetKeyForAddress(SENTINEL)).toBe(TON_ASSET_KEY);
        expect(assetKeyForAddress(JETTON)).toBe(JETTON.toString());
    });

    it('normalizes keys to a comparable form and rejects non-addresses', () => {
        expect(normalizeAssetKey(TON_ASSET_KEY)).toBe(TON_ASSET_KEY);
        expect(normalizeAssetKey(JETTON.toString())).toBe(JETTON.toRawString());
        expect(normalizeAssetKey('not-an-address')).toBeNull();
    });
});

describe('limits-codec round-trip', () => {
    it('round-trips StoredLimits -> dict -> StoredLimits', () => {
        expect(limitsDictToStored(storedToLimitsDict(STORED))).toEqual(STORED);
    });

    it('computes a hash invariant under asset- and window-key insertion order', () => {
        const reordered: StoredLimits = {
            assets: {
                [JETTON.toString()]: { windows: { '86400': '1000' } },
                [TON_ASSET_KEY]: { windows: { '3600': '20000000000', '0': '5000000000' } },
            },
        };
        expect(computeLimitsHash(storedToLimitsDict(reordered))).toBe(computeLimitsHash(storedToLimitsDict(STORED)));
    });

    it('parses the limitsDict back out of a ChangeNftContentMsg body', () => {
        const dict = storedToLimitsDict(STORED);
        const parsed = parseLimitsDictFromMessageBody(changeContentBody(dict));
        expect(parsed).not.toBeNull();
        expect(limitsDictToStored(parsed!)).toEqual(STORED);
        expect(computeLimitsHash(parsed!)).toBe(computeLimitsHash(dict));
    });

    it('returns null for a non-ChangeNftContentMsg opcode', () => {
        expect(parseLimitsDictFromMessageBody(changeContentBody(storedToLimitsDict(STORED), 0x12345678))).toBeNull();
    });

    it('returns null for a ChangeNftContentMsg with no trailing limitsDict', () => {
        const body = beginCell().storeUint(CHANGE_NFT_CONTENT_OP, 32).storeUint(1n, 64).storeMaybeRef(null).endCell();
        expect(parseLimitsDictFromMessageBody(body)).toBeNull();
    });
});

// -------------------------------------------------------------------------------------------------
// limits enforcement (findLimitViolation / maxRelevantWindow / formatLimitViolation / evaluateLimits)
// -------------------------------------------------------------------------------------------------

const LIMITS: StoredLimits = {
    assets: {
        [TON_ASSET_KEY]: { windows: { '0': '5', '3600': '20' } },
        [JETTON.toString()]: { windows: { '86400': '1000' } },
    },
};

function ton(amount: bigint): PendingSpend {
    return { ton: amount, jettons: new Map() };
}

describe('findLimitViolation', () => {
    it('blocks a transaction over the per-transaction (window 0) cap', () => {
        const v = findLimitViolation(LIMITS, ton(6n), [], NOW);
        expect(v).toMatchObject({ asset: TON_ASSET_KEY, windowSeconds: 0, limit: 5n, pending: 6n });
    });

    it('blocks when prior rolling-window spend plus the pending amount exceeds the cap', () => {
        const entries: SpendEntry[] = [{ timestamp: NOW - 100, asset: TON_ASSET_KEY, amount: 18n }];
        const v = findLimitViolation(LIMITS, ton(4n), entries, NOW);
        expect(v).toMatchObject({ windowSeconds: 3600, limit: 20n, alreadySpent: 18n, pending: 4n, total: 22n });
    });

    it('allows a transaction whose rolling total exactly equals the cap', () => {
        const entries: SpendEntry[] = [{ timestamp: NOW - 100, asset: TON_ASSET_KEY, amount: 18n }];
        expect(findLimitViolation(LIMITS, ton(2n), entries, NOW)).toBeNull();
    });

    it('reports the per-transaction cap first when both windows are breached', () => {
        const entries: SpendEntry[] = [{ timestamp: NOW - 100, asset: TON_ASSET_KEY, amount: 18n }];
        expect(findLimitViolation(LIMITS, ton(6n), entries, NOW)?.windowSeconds).toBe(0);
    });

    it('meters jettons against their own master cap', () => {
        const spend: PendingSpend = { ton: 0n, jettons: new Map([[JETTON_KEY, 600n]]) };
        const entries: SpendEntry[] = [{ timestamp: NOW - 100, asset: JETTON_KEY, amount: 500n }];
        expect(findLimitViolation(LIMITS, spend, entries, NOW)).toMatchObject({ windowSeconds: 86400, total: 1100n });
    });

    it('ignores assets that have no configured limit', () => {
        const spend: PendingSpend = { ton: 0n, jettons: new Map([['0:dead', 10n ** 30n]]) };
        expect(findLimitViolation(LIMITS, spend, [], NOW)).toBeNull();
    });

    it('fails closed (throws) on malformed config', () => {
        expect(() => findLimitViolation({ assets: { TON: { windows: { abc: '5' } } } }, ton(1n), [], NOW)).toThrow();
        expect(() => findLimitViolation({ assets: { xyz: { windows: { '0': '5' } } } }, ton(1n), [], NOW)).toThrow();
        expect(() => findLimitViolation({ assets: { TON: { windows: { '0': '-5' } } } }, ton(1n), [], NOW)).toThrow();
    });
});

describe('maxRelevantWindow', () => {
    it('returns the largest rolling window touched by the spend', () => {
        expect(maxRelevantWindow(LIMITS, ton(1n))).toBe(3600);
    });

    it('returns 0 when only a per-transaction limit applies', () => {
        const perTxOnly: StoredLimits = { assets: { [TON_ASSET_KEY]: { windows: { '0': '5' } } } };
        expect(maxRelevantWindow(perTxOnly, ton(1n))).toBe(0);
    });
});

describe('formatLimitViolation', () => {
    it('describes per-transaction and rolling breaches distinctly', () => {
        expect(formatLimitViolation(findLimitViolation(LIMITS, ton(6n), [], NOW)!)).toContain('per-transaction');
        const rolling = findLimitViolation(
            LIMITS,
            ton(4n),
            [{ timestamp: NOW, asset: TON_ASSET_KEY, amount: 18n }],
            NOW,
        )!;
        expect(formatLimitViolation(rolling)).toContain('rolling 1h');
    });
});

describe('evaluateLimits', () => {
    function env(overrides: Partial<LimitsEnv>): LimitsEnv {
        return {
            now: () => NOW,
            readOnchainLimitsHash: async () => 'hash-1',
            readCache: () => ({}),
            writeCache: async () => {},
            syncLimitsFromChain: async () => ({ limits: LIMITS, hash: 'hash-1' }),
            fetchSpendEntries: async () => [],
            ...overrides,
        };
    }

    it('allows and clears a stale cache when the wallet has no on-chain limits', async () => {
        const writeCache = vi.fn(async () => {});
        const decision = await evaluateLimits(
            env({
                readOnchainLimitsHash: async () => undefined,
                readCache: () => ({ limits_hash: 'old' }),
                writeCache,
            }),
            ton(1n),
        );
        expect(decision.allowed).toBe(true);
        expect(writeCache).toHaveBeenCalledWith({});
    });

    it('does not write when there is no on-chain hash and no cache to clear', async () => {
        const writeCache = vi.fn(async () => {});
        await evaluateLimits(env({ readOnchainLimitsHash: async () => undefined, writeCache }), ton(1n));
        expect(writeCache).not.toHaveBeenCalled();
    });

    it('uses the cache without re-syncing when the hash matches', async () => {
        const syncLimitsFromChain = vi.fn(async () => ({ limits: LIMITS, hash: 'hash-1' }));
        const decision = await evaluateLimits(
            env({ readCache: () => ({ limits: LIMITS, limits_hash: 'hash-1' }), syncLimitsFromChain }),
            ton(1n),
        );
        expect(decision.allowed).toBe(true);
        expect(syncLimitsFromChain).not.toHaveBeenCalled();
    });

    it('re-syncs and persists when the on-chain hash differs from the cache', async () => {
        const writeCache = vi.fn(async () => {});
        const decision = await evaluateLimits(env({ readCache: () => ({}), writeCache }), ton(1n));
        expect(decision.allowed).toBe(true);
        expect(writeCache).toHaveBeenCalledWith({ limits: LIMITS, limits_hash: 'hash-1' });
    });

    it('refuses to send when no limits-change transaction can be found', async () => {
        const decision = await evaluateLimits(env({ syncLimitsFromChain: async () => null }), ton(1n));
        expect(decision).toMatchObject({ allowed: false });
        expect(decision.allowed === false && decision.message).toContain('no limits-change');
    });

    it('refuses to send when the synced hash does not match the on-chain hash', async () => {
        const decision = await evaluateLimits(
            env({ syncLimitsFromChain: async () => ({ limits: LIMITS, hash: 'other' }) }),
            ton(1n),
        );
        expect(decision).toMatchObject({ allowed: false });
        expect(decision.allowed === false && decision.message).toContain('does not match');
    });

    it('skips the history fetch when only a per-transaction limit applies', async () => {
        const fetchSpendEntries = vi.fn(async () => []);
        const perTxOnly: StoredLimits = { assets: { [TON_ASSET_KEY]: { windows: { '0': '5' } } } };
        await evaluateLimits(
            env({ syncLimitsFromChain: async () => ({ limits: perTxOnly, hash: 'hash-1' }), fetchSpendEntries }),
            ton(1n),
        );
        expect(fetchSpendEntries).not.toHaveBeenCalled();
    });

    it('propagates (fails closed) when the history fetch throws', async () => {
        await expect(
            evaluateLimits(
                env({
                    fetchSpendEntries: async () => {
                        throw new Error('rpc down');
                    },
                }),
                ton(1n),
            ),
        ).rejects.toThrow('rpc down');
    });

    it('blocks an over-limit spend with a descriptive message', async () => {
        const decision = await evaluateLimits(env({}), ton(6n));
        expect(decision).toMatchObject({ allowed: false });
        expect(decision.allowed === false && decision.message).toContain('spend limit');
    });
});

// -------------------------------------------------------------------------------------------------
// limits-jetton (parseJettonOutflowAmount / getJettonWalletInfoFromClient)
// -------------------------------------------------------------------------------------------------

const OWNER = new Address(0, Buffer.alloc(32, 1));
const MASTER = new Address(0, Buffer.alloc(32, 9));

function opBody(op: number, amount: bigint): string {
    return beginCell().storeUint(op, 32).storeUint(0n, 64).storeCoins(amount).endCell().toBoc().toString('base64');
}

function addressStackItem(address: Address) {
    return { type: 'cell' as const, value: beginCell().storeAddress(address).endCell().toBoc().toString('base64') };
}

function clientWithRunGetMethod(impl: ApiClient['runGetMethod']): ApiClient {
    return { runGetMethod: impl } as unknown as ApiClient;
}

describe('parseJettonOutflowAmount', () => {
    it('reads the amount from a transfer or burn op', () => {
        expect(parseJettonOutflowAmount(opBody(JETTON_TRANSFER_OP, 1234n))).toBe(1234n);
        expect(parseJettonOutflowAmount(opBody(JETTON_BURN_OP, 77n))).toBe(77n);
    });

    it('returns null for a non-transfer op, an empty payload, or garbage', () => {
        expect(parseJettonOutflowAmount(opBody(0, 1n))).toBeNull();
        expect(parseJettonOutflowAmount(null)).toBeNull();
        expect(parseJettonOutflowAmount(undefined)).toBeNull();
        expect(parseJettonOutflowAmount('not-base64!!')).toBeNull();
    });
});

describe('getJettonWalletInfoFromClient', () => {
    it('resolves owner and master from a successful get_wallet_data', async () => {
        const client = clientWithRunGetMethod(
            vi.fn(async () => ({
                gasUsed: 0,
                exitCode: 0,
                stack: [{ type: 'num' as const, value: '100' }, addressStackItem(OWNER), addressStackItem(MASTER)],
            })),
        );
        await expect(getJettonWalletInfoFromClient(client, OWNER.toString())).resolves.toEqual({
            owner: OWNER.toString(),
            master: MASTER.toString(),
        });
    });

    it('returns null when get_wallet_data ran but exited non-zero (not a jetton wallet)', async () => {
        const client = clientWithRunGetMethod(vi.fn(async () => ({ gasUsed: 0, exitCode: -13, stack: [] })));
        await expect(getJettonWalletInfoFromClient(client, OWNER.toString())).resolves.toBeNull();
    });

    it('propagates (fails closed) when the get_wallet_data call itself throws', async () => {
        const client = clientWithRunGetMethod(
            vi.fn(async () => {
                throw new Error('429 Too Many Requests');
            }),
        );
        await expect(getJettonWalletInfoFromClient(client, OWNER.toString())).rejects.toThrow('429');
    });
});

// -------------------------------------------------------------------------------------------------
// limits-spend-window (transactionsToSpend / sumSpendWithinWindow)
// -------------------------------------------------------------------------------------------------

function jettonTransferBody(amount: bigint): string {
    return beginCell()
        .storeUint(JETTON_TRANSFER_OP, 32)
        .storeUint(0n, 64)
        .storeCoins(amount)
        .endCell()
        .toBoc()
        .toString('base64');
}

interface OutMsg {
    source?: string;
    destination?: string;
    value: string;
    body?: string;
}

function makeTx(input: { now: number; inValue?: string; outs?: OutMsg[]; computeSuccess?: boolean }): Transaction {
    return {
        account: WALLET,
        hash: 'tx' as Hex,
        logicalTime: '0',
        now: input.now,
        mcBlockSeqno: 0,
        traceExternalHash: 'trace' as Hex,
        isEmulated: false,
        inMessage: input.inValue === undefined ? undefined : { hash: 'in' as Hex, value: input.inValue },
        outMessages: (input.outs ?? []).map((out) => ({
            hash: 'out' as Hex,
            source: out.source,
            destination: out.destination,
            value: out.value,
            messageContent: out.body ? { body: out.body as Base64String } : undefined,
        })),
        description: {
            type: 'ord',
            isAborted: false,
            isDestroyed: false,
            isCreditFirst: false,
            isTock: false,
            isInstalled: false,
            computePhase: { isSuccess: input.computeSuccess ?? true },
        },
    };
}

describe('transactionsToSpend (TON)', () => {
    it('records the full outflow for an externally-triggered send (value-0 in-message)', () => {
        const spend = transactionsToSpend(
            [makeTx({ now: 100, outs: [{ source: WALLET, value: '1000000000' }] })],
            WALLET,
        );
        expect(spend.tonEntries).toEqual([{ timestamp: 100, asset: TON_ASSET_KEY, amount: 1000000000n }]);
    });

    it('meters a forwarding transaction at its net cost', () => {
        const spend = transactionsToSpend(
            [makeTx({ now: 100, inValue: '100000000', outs: [{ source: WALLET, value: '1000000000' }] })],
            WALLET,
        );
        expect(spend.tonEntries).toEqual([{ timestamp: 100, asset: TON_ASSET_KEY, amount: 900000000n }]);
    });

    it('records nothing for a purely incoming transaction', () => {
        const spend = transactionsToSpend([makeTx({ now: 100, inValue: '1000000000' })], WALLET);
        expect(spend.tonEntries).toEqual([]);
    });

    it('skips transactions whose compute phase failed', () => {
        const spend = transactionsToSpend(
            [makeTx({ now: 100, computeSuccess: false, outs: [{ source: WALLET, value: '1000000000' }] })],
            WALLET,
        );
        expect(spend.tonEntries).toEqual([]);
    });

    it('counts out-messages with an absent source but excludes a foreign source', () => {
        const absent = transactionsToSpend([makeTx({ now: 100, outs: [{ value: '5' }] })], WALLET);
        expect(absent.tonEntries).toEqual([{ timestamp: 100, asset: TON_ASSET_KEY, amount: 5n }]);
        const foreign = transactionsToSpend([makeTx({ now: 100, outs: [{ source: OTHER, value: '5' }] })], WALLET);
        expect(foreign.tonEntries).toEqual([]);
    });
});

describe('transactionsToSpend (jettons)', () => {
    it('emits a probe for an outgoing TEP-74 transfer', () => {
        const spend = transactionsToSpend(
            [
                makeTx({
                    now: 100,
                    outs: [
                        {
                            source: WALLET,
                            destination: JETTON_WALLET,
                            value: '50000000',
                            body: jettonTransferBody(500n),
                        },
                    ],
                }),
            ],
            WALLET,
        );
        expect(spend.jettonProbes).toEqual([{ timestamp: 100, jettonWalletAddress: JETTON_WALLET, amount: 500n }]);
    });
});

describe('sumSpendWithinWindow', () => {
    const entries: SpendEntry[] = [
        { timestamp: 940, asset: TON_ASSET_KEY, amount: 5n },
        { timestamp: 939, asset: TON_ASSET_KEY, amount: 7n },
        { timestamp: 1000, asset: 'jetton', amount: 9n },
    ];

    it('includes the entry exactly at the cutoff and excludes older ones', () => {
        expect(sumSpendWithinWindow(entries, TON_ASSET_KEY, 1000, 60)).toBe(5n);
    });

    it('filters by asset', () => {
        expect(sumSpendWithinWindow(entries, 'jetton', 1000, 60)).toBe(9n);
    });
});

// -------------------------------------------------------------------------------------------------
// McpWalletService send choke point
// -------------------------------------------------------------------------------------------------

function jettonTransferPayload(amount: bigint): string {
    return beginCell()
        .storeUint(0x0f8a7ea5, 32)
        .storeUint(0n, 64)
        .storeCoins(amount)
        .endCell()
        .toBoc()
        .toString('base64');
}

interface FakeWallet {
    version?: string;
    getAddress: () => string;
    getClient: () => unknown;
    sendTransaction: ReturnType<typeof vi.fn>;
    createTransferTonTransaction?: ReturnType<typeof vi.fn>;
}

function makeService(wallet: FakeWallet): McpWalletService {
    const service = Object.create(McpWalletService.prototype) as McpWalletService;
    Object.defineProperty(service, 'wallet', { value: wallet, configurable: true });
    Object.defineProperty(service, 'config', { value: {}, configurable: true });
    Object.defineProperty(service, 'limitsCache', { value: null, configurable: true });
    return service;
}

describe('McpWalletService send choke point', () => {
    it('skips limit enforcement for non-agentic wallets', async () => {
        const sendTransaction = vi.fn().mockResolvedValue({ normalizedHash: 'hash' });
        const getAccountState = vi.fn();
        const service = makeService({
            version: undefined,
            getAddress: () => WALLET,
            getClient: () => ({ getAccountState }),
            sendTransaction,
            createTransferTonTransaction: vi
                .fn()
                .mockResolvedValue({ messages: [{ address: RECIPIENT, amount: '1000000000' }] }),
        });

        const result = await service.sendTon(RECIPIENT, '1000000000');

        expect(result.success).toBe(true);
        expect(getAccountState).not.toHaveBeenCalled();
        expect(sendTransaction).toHaveBeenCalledOnce();
    });

    it('fails closed when an agentic wallet cannot read its on-chain limits', async () => {
        const sendTransaction = vi.fn();
        const service = makeService({
            version: 'agentic',
            getAddress: () => WALLET,
            getClient: () => ({
                getAccountState: vi.fn().mockRejectedValue(new Error('indexer down')),
                runGetMethod: vi.fn(),
            }),
            sendTransaction,
            createTransferTonTransaction: vi
                .fn()
                .mockResolvedValue({ messages: [{ address: RECIPIENT, amount: '1000000000' }] }),
        });

        const result = await service.sendTon(RECIPIENT, '1000000000');

        expect(result.success).toBe(false);
        expect(result.message).toContain('Could not verify spend limits');
        expect(sendTransaction).not.toHaveBeenCalled();
    });

    it('fails closed when a pending jetton wallet cannot be resolved (no silent TON-only metering)', async () => {
        const sendTransaction = vi.fn();
        const runGetMethod = vi.fn().mockRejectedValue(new Error('429 Too Many Requests'));
        const service = makeService({
            version: 'agentic',
            getAddress: () => WALLET,
            getClient: () => ({ runGetMethod, getAccountState: vi.fn() }),
            sendTransaction,
        });

        const result = await service.sendRawTransaction({
            messages: [{ address: JETTON_WALLET, amount: '50000000', payload: jettonTransferPayload(500n) }],
        });

        expect(result.success).toBe(false);
        expect(result.message).toContain('Could not verify spend limits');
        expect(sendTransaction).not.toHaveBeenCalled();
    });
});
