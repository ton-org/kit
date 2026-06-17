/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { getCardValueSvgProps } from './card-value-svg-props';
import type { CardValueSvgProps } from './card-value-svg-props';

export const FrostMageValue = (props: CardValueSvgProps) => (
    <svg {...getCardValueSvgProps('Frost Mage', props)}>
        <title>Frost Mage</title>
        <path
            d="M80 24V136M31 80H129M45 45L115 115M115 45L45 115"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth={7}
        />
        <circle cx="80" cy="80" r="24" fill="currentColor" opacity=".32" />
        <path
            d="M63 29L80 44L97 29M63 131L80 116L97 131M29 63L44 80L29 97M131 63L116 80L131 97"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={6}
            opacity=".72"
        />
    </svg>
);
