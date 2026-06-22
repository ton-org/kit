/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * The NFT a dApp is asking the user to mint. The minter passes it as an `asset`
 * query param on the link that reopens the wallet for approval; we stash it so
 * the mint-confirmation modal can show the real NFT (name + art) and the exact
 * gasless fee instead of hard-coded placeholders. Mirrors the lifecycle of the
 * `ret` return target in `./return-to-dapp`.
 */
export interface MintAsset {
    /** Display name of the NFT, e.g. "Storm Drake". */
    name: string;
    /** Image URL to render (a data URL or absolute URL). */
    image?: string;
    /** Pre-formatted gasless fee, e.g. "0.024594 USDT". */
    fee?: string;
}

const MINT_ASSET_KEY = 'demo-wallet:mint-asset';

/**
 * Capture the `asset` query param for the current request. Called as early as
 * possible (the root route redirects on mount and would otherwise strip the
 * query). Clears any stale asset when the param is absent — e.g. a plain
 * connect link — so an unrelated request never shows the previous NFT.
 */
export function rememberMintAsset(url: string): void {
    try {
        const raw = new URL(url).searchParams.get('asset');
        if (raw) {
            window.sessionStorage.setItem(MINT_ASSET_KEY, raw);
        } else {
            window.sessionStorage.removeItem(MINT_ASSET_KEY);
        }
    } catch {
        // Ignore malformed URLs — there's simply no asset to show.
    }
}

/** The asset captured for the current request, or `null` if none/invalid. */
export function getMintAsset(): MintAsset | null {
    const raw = window.sessionStorage.getItem(MINT_ASSET_KEY);
    if (!raw) {
        return null;
    }

    try {
        const parsed = JSON.parse(raw) as Partial<MintAsset>;
        if (typeof parsed.name !== 'string') {
            return null;
        }
        return {
            name: parsed.name,
            image: typeof parsed.image === 'string' ? parsed.image : undefined,
            fee: typeof parsed.fee === 'string' ? parsed.fee : undefined,
        };
    } catch {
        return null;
    }
}
