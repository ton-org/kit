/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { getCardValueSvgProps } from './card-value-svg-props';
import type { CardValueSvgProps } from './card-value-svg-props';

export const DustElementalValue = (props: CardValueSvgProps) => (
    <svg {...getCardValueSvgProps('Dust Elemental', props)}>
        <title>Dust Elemental</title>
        <path
            d="M45 104C75 126 122 112 124 78C126 46 86 33 63 53C47 67 51 88 72 88H98"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth={10}
        />
        <path d="M39 127H94" stroke="currentColor" strokeLinecap="round" strokeWidth={8} opacity=".5" />
        <circle cx="43" cy="48" r="7" fill="currentColor" opacity=".6" />
        <circle cx="117" cy="119" r="5" fill="currentColor" opacity=".48" />
        <circle cx="124" cy="44" r="4" fill="currentColor" opacity=".36" />
    </svg>
);
