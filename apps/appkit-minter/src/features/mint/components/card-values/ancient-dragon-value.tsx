/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { getCardValueSvgProps } from './card-value-svg-props';
import type { CardValueSvgProps } from './card-value-svg-props';

export const AncientDragonValue = (props: CardValueSvgProps) => (
    <svg {...getCardValueSvgProps('Ancient Dragon', props)}>
        <title>Ancient Dragon</title>
        <path
            d="M40 112C58 79 88 64 123 70C108 87 91 96 70 96C88 106 101 119 109 137C76 137 53 129 40 112Z"
            fill="currentColor"
            opacity=".7"
        />
        <path
            d="M64 68L78 25L91 64M91 64L122 39L111 76"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={8}
        />
        <path
            d="M59 107C72 88 89 77 111 73"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth={7}
            opacity=".38"
        />
    </svg>
);
