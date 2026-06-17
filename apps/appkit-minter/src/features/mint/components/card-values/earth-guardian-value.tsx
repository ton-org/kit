/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { getCardValueSvgProps } from './card-value-svg-props';
import type { CardValueSvgProps } from './card-value-svg-props';

export const EarthGuardianValue = (props: CardValueSvgProps) => (
    <svg {...getCardValueSvgProps('Earth Guardian', props)}>
        <title>Earth Guardian</title>
        <path
            d="M80 20L124 39V72C124 101 106 127 80 140C54 127 36 101 36 72V39L80 20Z"
            fill="currentColor"
            opacity=".3"
        />
        <path d="M48 108L74 67L91 92L104 74L128 108H48Z" fill="currentColor" opacity=".82" />
        <path d="M80 38V135" stroke="currentColor" strokeLinecap="round" strokeWidth={7} opacity=".52" />
        <path
            d="M61 47L80 34L99 47"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={7}
        />
    </svg>
);
