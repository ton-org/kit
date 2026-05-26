/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { getCardValueSvgProps } from './card-value-svg-props';
import type { CardValueSvgProps } from './card-value-svg-props';

export const ShadowCatValue = (props: CardValueSvgProps) => (
    <svg {...getCardValueSvgProps('Shadow Cat', props)}>
        <title>Shadow Cat</title>
        <path
            d="M44 69L55 34L76 58H84L105 34L116 69C127 80 132 96 127 112C120 134 99 143 80 143C61 143 40 134 33 112C28 96 33 80 44 69Z"
            fill="currentColor"
            opacity=".66"
        />
        <path d="M62 94L75 88M98 94L85 88" stroke="currentColor" strokeLinecap="round" strokeWidth={8} opacity=".34" />
        <path
            d="M34 123C52 116 70 116 80 128C90 116 108 116 126 123"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth={7}
        />
    </svg>
);
