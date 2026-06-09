/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { getCardValueSvgProps } from './card-value-svg-props';
import type { CardValueSvgProps } from './card-value-svg-props';

export const MountainGiantValue = (props: CardValueSvgProps) => (
    <svg {...getCardValueSvgProps('Mountain Giant', props)}>
        <title>Mountain Giant</title>
        <path d="M24 131L63 58L81 91L101 29L137 131H24Z" fill="currentColor" opacity=".62" />
        <path
            d="M63 58L77 84L101 29L112 61"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={8}
        />
        <path
            d="M48 131V106M78 131V100M112 131V103"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth={8}
            opacity=".36"
        />
    </svg>
);
