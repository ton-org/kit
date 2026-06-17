/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { getCardValueSvgProps } from './card-value-svg-props';
import type { CardValueSvgProps } from './card-value-svg-props';

export const WindWispValue = (props: CardValueSvgProps) => (
    <svg {...getCardValueSvgProps('Wind Wisp', props)}>
        <title>Wind Wisp</title>
        <path
            d="M37 62C57 43 90 43 104 60C119 78 106 99 82 99H49"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth={10}
        />
        <path
            d="M54 91H117C134 91 139 113 123 122C110 130 95 125 89 113"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth={9}
            opacity=".64"
        />
        <path d="M31 118H70" stroke="currentColor" strokeLinecap="round" strokeWidth={8} opacity=".44" />
        <circle cx="114" cy="50" r="6" fill="currentColor" opacity=".72" />
    </svg>
);
