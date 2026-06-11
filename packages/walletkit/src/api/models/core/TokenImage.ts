/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * Token image for display purposes.
 */
export interface TokenImage {
    /**
     * Candidate image URLs, ordered best-first (consumers should use the first usable one).
     * @format url
     */
    urls: string[];

    /**
     * Raw image data encoded in Base64
     * @format byte
     */
    data?: string;
}
