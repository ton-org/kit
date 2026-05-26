/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { getCardValueSvgProps } from './card-value-svg-props';
import type { CardValueSvgProps } from './card-value-svg-props';

export const FlameImpValue = (props: CardValueSvgProps) => (
    <svg {...getCardValueSvgProps('Flame Imp', props)}>
        <title>Flame Imp</title>
        <path
            d="M84 18C93 42 121 55 119 88C117 120 96 141 77 141C54 141 38 124 40 99C42 75 63 67 61 43C72 51 77 61 78 72C88 61 94 42 84 18Z"
            fill="currentColor"
            opacity=".72"
        />
        <path d="M77 82C90 96 92 113 80 128C65 121 60 106 66 92C69 87 73 84 77 82Z" fill="currentColor" opacity=".36" />
        <path
            d="M48 52L36 37M112 52L124 37"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth={8}
            opacity=".58"
        />
    </svg>
);
