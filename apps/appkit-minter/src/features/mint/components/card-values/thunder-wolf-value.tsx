/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { getCardValueSvgProps } from './card-value-svg-props';
import type { CardValueSvgProps } from './card-value-svg-props';

export const ThunderWolfValue = (props: CardValueSvgProps) => (
    <svg {...getCardValueSvgProps('Thunder Wolf', props)}>
        <title>Thunder Wolf</title>
        <path d="M34 103L52 53L78 76L108 37L126 103L92 127H68L34 103Z" fill="currentColor" opacity=".48" />
        <path d="M83 24L58 80H81L72 136L108 68H86L83 24Z" fill="currentColor" opacity=".84" />
        <path d="M54 99L70 91M106 99L90 91" stroke="currentColor" strokeLinecap="round" strokeWidth={7} opacity=".34" />
    </svg>
);
