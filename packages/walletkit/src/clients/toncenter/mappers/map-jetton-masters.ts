/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { JettonInfo, JettonMastersResponse } from '../../../types/jettons';
import type { EmulationTokenInfoMasters } from '../types/metadata';
import type { ToncenterResponseJettonMasters } from '../types/jettons';
import { asAddressFriendly } from '../../../utils/address';
import { mapAddressBook } from './map-address-book';

/**
 * Collects candidate image URLs (best-first) from a toncenter jetton-masters
 * token_info: the wire `image` plus the proxied size variants under `extra`.
 */
function collectImages(info: EmulationTokenInfoMasters): string[] {
    const candidates = [info.image, info.extra._image_big, info.extra._image_medium, info.extra._image_small];
    return [...new Set(candidates.filter((url): url is string => Boolean(url)))];
}

/**
 * Maps a raw toncenter `/api/v3/jetton/masters` response into the normalized
 * {@link JettonMastersResponse}.
 */
export function mapJettonMastersResponse(raw: ToncenterResponseJettonMasters): JettonMastersResponse {
    const masters: JettonInfo[] = raw.jetton_masters.map((master) => {
        const tokenInfo = raw.metadata[master.address]?.token_info?.find(
            (info): info is EmulationTokenInfoMasters => info.valid && info.type === 'jetton_masters',
        );

        return {
            address: asAddressFriendly(master.jetton),
            name: tokenInfo?.name ?? '',
            symbol: tokenInfo?.symbol ?? '',
            description: tokenInfo?.description ?? '',
            decimals: tokenInfo?.extra.decimals ? parseInt(tokenInfo.extra.decimals, 10) : undefined,
            images: tokenInfo ? collectImages(tokenInfo) : [],
            image_data: tokenInfo?.extra.image_data,
            uri: tokenInfo?.extra.uri,
        };
    });

    return { masters, addressBook: mapAddressBook(raw.address_book) };
}
