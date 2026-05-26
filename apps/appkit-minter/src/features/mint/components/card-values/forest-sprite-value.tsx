/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { getCardValueSvgProps } from './card-value-svg-props';
import type { CardValueSvgProps } from './card-value-svg-props';

export const ForestSpriteValue = (props: CardValueSvgProps) => (
    <svg {...getCardValueSvgProps('Forest Sprite', props)}>
        <title>Forest Sprite</title>
        <path d="M78 134C76 108 83 78 109 42" stroke="currentColor" strokeLinecap="round" strokeWidth={7} />
        <path d="M80 84C45 81 33 48 47 24C78 25 98 45 92 74C90 80 86 83 80 84Z" fill="currentColor" opacity=".82" />
        <path d="M77 92C52 97 39 122 50 142C76 138 93 120 91 99C88 95 84 93 77 92Z" fill="currentColor" opacity=".54" />
        <circle cx="115" cy="35" r="7" fill="currentColor" opacity=".68" />
        <circle cx="123" cy="62" r="4" fill="currentColor" opacity=".4" />
    </svg>
);
