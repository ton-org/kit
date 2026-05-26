/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { getCardValueSvgProps } from './card-value-svg-props';
import type { CardValueSvgProps } from './card-value-svg-props';

export const EternalPhoenixValue = (props: CardValueSvgProps) => (
    <svg {...getCardValueSvgProps('Eternal Phoenix', props)}>
        <title>Eternal Phoenix</title>
        <path
            d="M44 94C44 68 61 53 80 80C99 53 116 68 116 94C116 119 94 126 80 101C66 126 44 119 44 94Z"
            stroke="currentColor"
            strokeWidth={10}
        />
        <path
            d="M80 20C92 51 102 71 126 83C105 90 91 88 80 76C72 93 70 113 78 142C57 123 51 101 62 80C70 65 79 49 80 20Z"
            fill="currentColor"
            opacity=".54"
        />
        <path d="M36 62C52 61 65 68 76 84C57 86 43 78 36 62Z" fill="currentColor" opacity=".42" />
    </svg>
);
