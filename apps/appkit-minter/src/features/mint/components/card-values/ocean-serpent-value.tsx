/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { getCardValueSvgProps } from './card-value-svg-props';
import type { CardValueSvgProps } from './card-value-svg-props';

export const OceanSerpentValue = (props: CardValueSvgProps) => (
    <svg {...getCardValueSvgProps('Ocean Serpent', props)}>
        <title>Ocean Serpent</title>
        <path
            d="M34 104C54 81 77 80 95 98C108 111 126 107 134 90"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth={12}
        />
        <path
            d="M47 78C66 55 89 54 107 72C118 83 129 82 139 70"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth={9}
            opacity=".52"
        />
        <path d="M86 41C104 36 119 45 125 62C109 66 96 59 86 41Z" fill="currentColor" opacity=".74" />
        <path
            d="M27 126C45 116 63 116 81 126C99 136 117 136 135 126"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth={7}
            opacity=".44"
        />
    </svg>
);
