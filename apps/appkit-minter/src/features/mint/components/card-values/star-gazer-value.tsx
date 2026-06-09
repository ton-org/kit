/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { getCardValueSvgProps } from './card-value-svg-props';
import type { CardValueSvgProps } from './card-value-svg-props';

export const StarGazerValue = (props: CardValueSvgProps) => (
    <svg {...getCardValueSvgProps('Star Gazer', props)}>
        <title>Star Gazer</title>
        <path d="M89 31L95 48L113 54L96 62L90 80L82 63L64 57L82 49L89 31Z" fill="currentColor" />
        <path d="M44 124L88 80" stroke="currentColor" strokeLinecap="round" strokeWidth={10} />
        <path d="M67 91L108 50L125 67L84 108L67 91Z" fill="currentColor" opacity=".5" />
        <circle cx="39" cy="129" r="13" fill="currentColor" opacity=".68" />
        <circle cx="122" cy="35" r="5" fill="currentColor" opacity=".58" />
    </svg>
);
