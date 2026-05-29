/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { getCardValueSvgProps } from './card-value-svg-props';
import type { CardValueSvgProps } from './card-value-svg-props';

export const EmberPhoenixValue = (props: CardValueSvgProps) => (
    <svg {...getCardValueSvgProps('Ember Phoenix', props)}>
        <title>Ember Phoenix</title>
        <path
            d="M80 24C97 54 113 72 139 80C118 91 100 91 85 80C93 103 88 123 73 140C74 113 62 95 38 85C57 76 71 57 80 24Z"
            fill="currentColor"
            opacity=".78"
        />
        <path d="M39 52C55 52 69 60 80 78C61 79 47 70 39 52Z" fill="currentColor" opacity=".42" />
        <path d="M112 39C106 55 96 68 80 78C80 58 91 45 112 39Z" fill="currentColor" opacity=".52" />
    </svg>
);
