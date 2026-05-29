/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { getCardValueSvgProps } from './card-value-svg-props';
import type { CardValueSvgProps } from './card-value-svg-props';

export const VoidWalkerValue = (props: CardValueSvgProps) => (
    <svg {...getCardValueSvgProps('Void Walker', props)}>
        <title>Void Walker</title>
        <circle cx="80" cy="72" r="43" stroke="currentColor" strokeWidth={9} />
        <circle cx="80" cy="72" r="22" fill="currentColor" opacity=".42" />
        <path d="M63 124H97M51 143H109" stroke="currentColor" strokeLinecap="round" strokeWidth={9} opacity=".64" />
        <path
            d="M34 72C44 53 58 41 80 29C102 41 116 53 126 72"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth={5}
            opacity=".38"
        />
    </svg>
);
