/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { AddressBookRowV3 } from '../../../types/toncenter/v3/AddressBookRowV3';
import type { EmulationAddressBookEntry } from '../../../api/models';
import { asAddressFriendly } from '../../../utils/address';

/**
 * Normalizes a raw toncenter `address_book` map into our owned address-book model.
 */
export function mapAddressBook(
    addressBook?: Record<string, AddressBookRowV3>,
): Record<string, EmulationAddressBookEntry> {
    return Object.fromEntries(
        Object.entries(addressBook ?? {}).map(([addr, row]) => [
            addr,
            {
                domain: row.domain ?? undefined,
                userFriendly: asAddressFriendly(row.user_friendly),
                interfaces: row.interfaces ?? [],
            },
        ]),
    );
}
