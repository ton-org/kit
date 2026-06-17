/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { getCardValueSvgProps } from './card-value-svg-props';
import type { CardValueSvgProps } from './card-value-svg-props';

export const RiverNymphValue = (props: CardValueSvgProps) => (
    <svg {...getCardValueSvgProps('River Nymph', props)}>
        <title>River Nymph</title>
        <path
            d="M80 18C101 44 112 65 112 87C112 110 97 128 80 128C63 128 48 110 48 87C48 65 59 44 80 18Z"
            fill="currentColor"
            opacity=".38"
        />
        <path
            d="M31 101C48 86 65 86 82 101C99 116 116 116 133 101"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth={10}
        />
        <path
            d="M35 124C51 113 67 113 83 124C99 135 115 135 131 124"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth={8}
            opacity=".54"
        />
        <path d="M67 68C75 75 85 75 93 68" stroke="currentColor" strokeLinecap="round" strokeWidth={7} opacity=".68" />
    </svg>
);
