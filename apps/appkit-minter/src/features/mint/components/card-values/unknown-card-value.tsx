/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { getCardValueSvgProps } from './card-value-svg-props';
import type { CardValueSvgProps } from './card-value-svg-props';

export const UnknownCardValue = (props: CardValueSvgProps) => (
    <svg {...getCardValueSvgProps('Unknown Card', props)}>
        <title>Unknown Card</title>
        <circle cx="80" cy="80" r="48" stroke="currentColor" strokeWidth={9} opacity=".72" />
        <path
            d="M80 33L94 67L130 70L102 93L111 128L80 109L49 128L58 93L30 70L66 67L80 33Z"
            fill="currentColor"
            opacity=".58"
        />
    </svg>
);
