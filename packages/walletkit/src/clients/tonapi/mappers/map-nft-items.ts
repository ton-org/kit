/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { NFT, NFTsResponse } from '../../../api/models';
import type { AddressBookEntry } from '../../../api/models/core/AddressBook';
import { asAddressFriendly } from '../../../utils/address';
import type { TonApiNftItem, TonApiNftPreview } from '../types/nfts';

/** Pixel area for a `"WxH"` resolution string; 0 when unparseable. */
function previewArea(resolution: string): number {
    const parts = resolution.split('x');
    const width = parseInt(parts[0] ?? '', 10);
    const height = parseInt(parts[1] ?? '', 10);
    return Number.isFinite(width) && Number.isFinite(height) ? width * height : 0;
}

/** Preview URLs ordered largest-first, so consumers prefer the highest-resolution image. */
function previewUrlsLargestFirst(previews?: TonApiNftPreview[]): string[] {
    return [...(previews ?? [])]
        .sort((a, b) => previewArea(b.resolution) - previewArea(a.resolution))
        .map((preview) => preview.url);
}

export function mapNftItem(item: TonApiNftItem): NFT {
    const isVerified = item.trust === 'whitelist' || item.verified;

    const nft: NFT = {
        address: asAddressFriendly(item.address),
        index: item.index.toString(),
        ownerAddress: item.owner ? asAddressFriendly(item.owner.address) : undefined,
        collection: item.collection
            ? {
                  address: asAddressFriendly(item.collection.address),
                  name: item.collection.name,
                  description: item.collection.description,
              }
            : undefined,
        info: {
            name: item.metadata.name ?? '',
            description: item.metadata.description ?? '',
            image: {
                // Largest proxied preview first (crisp + more likely to load), original metadata image last.
                urls: [
                    ...new Set(
                        [...previewUrlsLargestFirst(item.previews), item.metadata.image].filter((url): url is string =>
                            Boolean(url),
                        ),
                    ),
                ],
            },
        },
        attributes: item.metadata.attributes?.map((attr) => ({
            traitType: attr.trait_type,
            value: attr.value,
        })),
        extra: {
            isVerified,
            trust: item.trust,
            contentUrl: item.metadata.content_url,
            previews: item.previews,
            approvedBy: item.approved_by,
        },
    };

    return nft;
}

export function mapNftItemsResponse(items: TonApiNftItem[]): NFTsResponse {
    const addressBook: Record<string, AddressBookEntry> = {};

    items.forEach((item) => {
        if (item.owner) {
            const address = asAddressFriendly(item.owner.address);
            if (!addressBook[address]) {
                addressBook[address] = {
                    address: address,
                    domain: item.owner.name ?? undefined,
                    interfaces: [],
                };
            }
        }
    });

    return {
        addressBook,
        nfts: items.map(mapNftItem),
    };
}
