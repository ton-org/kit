/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { getCardValueSvgProps } from './card-value-svg-props';
import type { CardValueSvgProps } from './card-value-svg-props';

export const ChaosLordValue = (props: CardValueSvgProps) => (
    <svg {...getCardValueSvgProps('Chaos Lord', props)}>
        <title>Chaos Lord</title>
        <path
            d="M81 21L98 59L139 48L115 82L145 111L103 108L91 148L72 111L31 122L55 88L25 59L67 62L81 21Z"
            fill="currentColor"
            opacity=".7"
        />
        <circle cx="80" cy="84" r="23" fill="currentColor" opacity=".28" />
        <path
            d="M43 46C61 33 83 29 103 36M119 62C134 79 139 101 132 122M104 135C84 145 62 143 44 131"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth={7}
            opacity=".52"
        />
    </svg>
);
