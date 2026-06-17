/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { getCardValueSvgProps } from './card-value-svg-props';
import type { CardValueSvgProps } from './card-value-svg-props';

export const DivineGuardianValue = (props: CardValueSvgProps) => (
    <svg {...getCardValueSvgProps('Divine Guardian', props)}>
        <title>Divine Guardian</title>
        <ellipse cx="80" cy="37" rx="30" ry="13" stroke="currentColor" strokeWidth={7} />
        <path
            d="M80 58L116 73V98C116 120 101 136 80 144C59 136 44 120 44 98V73L80 58Z"
            fill="currentColor"
            opacity=".44"
        />
        <path d="M42 83C25 89 21 106 31 122C50 116 59 101 55 82" fill="currentColor" opacity=".58" />
        <path d="M118 83C135 89 139 106 129 122C110 116 101 101 105 82" fill="currentColor" opacity=".58" />
        <path d="M80 75V124M62 96H98" stroke="currentColor" strokeLinecap="round" strokeWidth={8} />
    </svg>
);
