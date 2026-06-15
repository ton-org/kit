/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Address } from '@ton/core';

import type { JettonInfo, JettonMastersResponse } from '../../../types/jettons';
import type { EmulationAddressBookEntry } from '../../../api/models';
import type { TonApiJettonInfo } from '../types/jettons';
import { asAddressFriendly } from '../../../utils/address';

function toRaw(address: string): string {
    return Address.parse(address).toRawString();
}

export function mapJettonMasters(jettonInfo: TonApiJettonInfo): JettonMastersResponse {
    const jettonRaw = toRaw(jettonInfo.metadata.address);
    const jettonFriendly = asAddressFriendly(jettonInfo.metadata.address);

    const addressBook: Record<string, EmulationAddressBookEntry> = {};

    if (jettonInfo.admin) {
        addressBook[toRaw(jettonInfo.admin.address)] = {
            userFriendly: asAddressFriendly(jettonInfo.admin.address),
            domain: jettonInfo.admin.name ?? undefined,
            interfaces: [],
        };
    }

    addressBook[jettonRaw] = {
        userFriendly: jettonFriendly,
        domain: undefined,
        interfaces: ['jetton_master'],
    };

    const master: JettonInfo = {
        address: jettonFriendly,
        name: jettonInfo.metadata.name,
        symbol: jettonInfo.metadata.symbol,
        description: jettonInfo.metadata.description ?? '',
        decimals: jettonInfo.metadata.decimals ? parseInt(jettonInfo.metadata.decimals, 10) : undefined,
        // Proxied preview (cache.tonapi.io) first, raw metadata image last.
        images: [jettonInfo.preview, jettonInfo.metadata.image].filter((url): url is string => Boolean(url)),
        totalSupply: jettonInfo.total_supply,
    };

    return { masters: [master], addressBook };
}
