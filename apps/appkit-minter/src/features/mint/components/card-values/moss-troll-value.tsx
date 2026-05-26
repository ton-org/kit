/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { getCardValueSvgProps } from './card-value-svg-props';
import type { CardValueSvgProps } from './card-value-svg-props';

export const MossTrollValue = (props: CardValueSvgProps) => (
    <svg {...getCardValueSvgProps('Moss Troll', props)}>
        <title>Moss Troll</title>
        <path d="M37 89C37 53 56 31 80 31C104 31 123 53 123 89V130H37V89Z" fill="currentColor" opacity=".48" />
        <path
            d="M38 64C48 50 57 47 66 55C75 36 91 36 100 55C109 47 118 50 128 64"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={9}
        />
        <path d="M61 92H67M93 92H99" stroke="currentColor" strokeLinecap="round" strokeWidth={8} opacity=".38" />
        <path d="M58 119H102" stroke="currentColor" strokeLinecap="round" strokeWidth={8} opacity=".58" />
    </svg>
);
