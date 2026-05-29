/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { getCardValueSvgProps } from './card-value-svg-props';
import type { CardValueSvgProps } from './card-value-svg-props';

export const CelestialKnightValue = (props: CardValueSvgProps) => (
    <svg {...getCardValueSvgProps('Celestial Knight', props)}>
        <title>Celestial Knight</title>
        <path
            d="M80 22L121 42V72C121 103 104 127 80 140C56 127 39 103 39 72V42L80 22Z"
            fill="currentColor"
            opacity=".42"
        />
        <path d="M80 35V126M58 59H102" stroke="currentColor" strokeLinecap="round" strokeWidth={9} />
        <path d="M35 35L43 50L59 57L43 64L35 79L27 64L11 57L27 50L35 35Z" fill="currentColor" opacity=".66" />
        <path d="M124 22L130 34L143 40L130 46L124 58L118 46L105 40L118 34L124 22Z" fill="currentColor" opacity=".56" />
    </svg>
);
