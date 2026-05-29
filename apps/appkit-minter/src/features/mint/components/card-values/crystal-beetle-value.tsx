/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { getCardValueSvgProps } from './card-value-svg-props';
import type { CardValueSvgProps } from './card-value-svg-props';

export const CrystalBeetleValue = (props: CardValueSvgProps) => (
    <svg {...getCardValueSvgProps('Crystal Beetle', props)}>
        <title>Crystal Beetle</title>
        <path d="M80 20L120 54L106 124L80 144L54 124L40 54L80 20Z" fill="currentColor" opacity=".34" />
        <path
            d="M80 20V144M40 54H120M54 124L80 54L106 124"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={6}
        />
        <path
            d="M40 88H24M120 88H136M49 112L31 126M111 112L129 126"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth={7}
            opacity=".56"
        />
    </svg>
);
