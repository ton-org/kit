/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { getCardValueSvgProps } from './card-value-svg-props';
import type { CardValueSvgProps } from './card-value-svg-props';

export const PrimordialDragonValue = (props: CardValueSvgProps) => (
    <svg {...getCardValueSvgProps('Primordial Dragon', props)}>
        <title>Primordial Dragon</title>
        <path
            d="M35 119C56 82 89 63 128 64C112 86 92 99 67 103C85 112 99 125 108 143C76 143 51 135 35 119Z"
            fill="currentColor"
            opacity=".62"
        />
        <path
            d="M66 61L77 18L91 59L125 31L111 76"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={9}
        />
        <path
            d="M43 78L27 50M52 71L46 37M58 117L44 142M82 111L82 146M106 99L125 128"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth={7}
            opacity=".52"
        />
    </svg>
);
