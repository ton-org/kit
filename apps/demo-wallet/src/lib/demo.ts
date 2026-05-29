/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { Jetton } from '@ton/walletkit';

import { USDT_ADDRESS } from '@/constants/swap';

/**
 * Demo presentation mode.
 *
 * When enabled, the wallet dashboard shows a fixed, clean state for
 * recordings/demos: 0 TON, a single 100 USDT balance, no other assets,
 * no activity and no NFTs. Flip to `false` to restore real on-chain data.
 */
export const DEMO_MODE = true;

const DEMO_USDT_DECIMALS = 6;
const DEMO_USDT_BALANCE = '100';
export const DEMO_USDT_IMAGE = 'https://assets.coingecko.com/coins/images/325/standard/Tether.png';

/** Single demo activity entry: an incoming 100 USDT transfer. */
export const DEMO_ACTIVITY = {
    description: 'Received 100 USDT',
    value: '100 USDT',
    image: DEMO_USDT_IMAGE,
};

/** Fallback USDT jetton used only if the wallet has none of its own. */
const DEMO_USDT_FALLBACK: Jetton = {
    address: USDT_ADDRESS,
    walletAddress: USDT_ADDRESS,
    balance: toRawAmount(DEMO_USDT_BALANCE, DEMO_USDT_DECIMALS),
    decimalsNumber: DEMO_USDT_DECIMALS,
    isVerified: true,
    prices: [],
    info: {
        name: 'Tether USD',
        symbol: 'USDT',
        image: { url: DEMO_USDT_IMAGE },
    },
};

function toRawAmount(amount: string, decimals: number): string {
    return (BigInt(amount) * 10n ** BigInt(decimals)).toString();
}

/**
 * Collapses the wallet's jettons down to a single 100 USDT entry for the demo.
 * Reuses the wallet's real USDT metadata (icon, name) when available so the
 * row looks authentic, otherwise falls back to a synthetic entry.
 */
export function toDemoJettons(jettons: Jetton[]): Jetton[] {
    const existing = jettons.find(
        (jetton) => (jetton.info?.symbol ?? '').toUpperCase() === 'USDT' || /tether/i.test(jetton.info?.name ?? ''),
    );
    const base = existing ?? DEMO_USDT_FALLBACK;
    const decimals = base.decimalsNumber ?? DEMO_USDT_DECIMALS;

    return [{ ...base, balance: toRawAmount(DEMO_USDT_BALANCE, decimals) }];
}
