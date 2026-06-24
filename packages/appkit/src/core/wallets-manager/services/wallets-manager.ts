/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { AppKitEmitter } from '../../../core/app-kit';
import { WALLETS_EVENTS } from '../../../core/app-kit';
import type { WalletInterface } from '../../../types/wallet';

/**
 * Manages connected wallets.
 */
export class WalletsManager {
    private _wallets: WalletInterface[];
    private _selectedWalletId: string | null;
    private emitter: AppKitEmitter;

    constructor(emitter: AppKitEmitter) {
        this._wallets = [];
        this._selectedWalletId = null;
        this.emitter = emitter;
    }

    /**
     * All connected wallets
     */
    get wallets(): WalletInterface[] {
        return this._wallets;
    }

    /**
     * Selected wallet id
     */
    get selectedWalletId(): string | null {
        return this._selectedWalletId;
    }

    /**
     * Selected wallet
     */
    get selectedWallet(): WalletInterface | null {
        if (!this._selectedWalletId) {
            return null;
        }

        return this._wallets.find((wallet) => wallet.getWalletId() === this._selectedWalletId) ?? null;
    }

    /**
     * Set selected wallet id
     */
    setSelectedWalletId(id: string | null): void {
        if (this._selectedWalletId === id) return;

        this._selectedWalletId = id;
        this.emitter.emit(WALLETS_EVENTS.SELECTION_CHANGED, { walletId: id }, 'wallets-manager');
    }

    /**
     * Set connected wallets
     * Automatically handles selected wallet state
     */
    setWallets(wallets: WalletInterface[]): void {
        this._wallets = wallets;

        // If currently selected wallet is still in the new list, keep it
        if (this._selectedWalletId && wallets.some((w) => w.getWalletId() === this._selectedWalletId)) {
            return;
        }

        // Auto-select the first wallet, or clear selection when the list is empty.
        this.setSelectedWalletId(wallets.length > 0 ? wallets[0].getWalletId() : null);
    }
}
