/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { getCardValueSvgProps } from './card-value-svg-props';
import type { CardValueSvgProps } from './card-value-svg-props';

export const ShadowReaperValue = (props: CardValueSvgProps) => (
    <svg {...getCardValueSvgProps('Shadow Reaper', props)}>
        <title>Shadow Reaper</title>
        <path d="M54 30C88 28 117 48 126 80C102 73 79 76 58 91C43 75 41 50 54 30Z" fill="currentColor" opacity=".58" />
        <path d="M91 43L55 139" stroke="currentColor" strokeLinecap="round" strokeWidth={9} />
        <path
            d="M44 124C62 113 82 110 105 118"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth={8}
            opacity=".48"
        />
        <path d="M70 86C87 73 106 67 126 70" stroke="currentColor" strokeLinecap="round" strokeWidth={7} />
    </svg>
);
