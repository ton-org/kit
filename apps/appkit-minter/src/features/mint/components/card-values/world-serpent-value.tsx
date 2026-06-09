/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { getCardValueSvgProps } from './card-value-svg-props';
import type { CardValueSvgProps } from './card-value-svg-props';

export const WorldSerpentValue = (props: CardValueSvgProps) => (
    <svg {...getCardValueSvgProps('World Serpent', props)}>
        <title>World Serpent</title>
        <circle cx="80" cy="80" r="48" stroke="currentColor" strokeWidth={12} opacity=".68" />
        <path d="M111 46C127 48 137 58 140 74C124 80 111 75 101 61L111 46Z" fill="currentColor" />
        <path d="M50 115C35 107 26 95 22 80" stroke="currentColor" strokeLinecap="round" strokeWidth={10} />
        <path
            d="M99 58L124 39M109 67L137 61"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth={6}
            opacity=".42"
        />
    </svg>
);
