/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { TokenImage } from '@ton/walletkit';

/**
 * Flatten a wallet-kit {@link TokenImage} into candidate image URLs, best-first.
 * The kit exposes discrete size fields; the UI consumes an ordered list and
 * picks the first usable one.
 */
export const tokenImageUrls = (image: TokenImage | undefined): string[] =>
    image
        ? [image.url, image.largeUrl, image.mediumUrl, image.smallUrl].filter((url): url is string => Boolean(url))
        : [];
