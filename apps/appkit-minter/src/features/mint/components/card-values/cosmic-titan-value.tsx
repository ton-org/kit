/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { getCardValueSvgProps } from './card-value-svg-props';
import type { CardValueSvgProps } from './card-value-svg-props';

export const CosmicTitanValue = (props: CardValueSvgProps) => (
    <svg {...getCardValueSvgProps('Cosmic Titan', props)}>
        <title>Cosmic Titan</title>
        <circle cx="80" cy="62" r="31" fill="currentColor" opacity=".5" />
        <path d="M32 72C59 55 102 55 128 72" stroke="currentColor" strokeLinecap="round" strokeWidth={8} />
        <path
            d="M54 135V94M80 142V94M106 135V94"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth={11}
            opacity=".72"
        />
        <path d="M42 94H118" stroke="currentColor" strokeLinecap="round" strokeWidth={9} />
        <circle cx="121" cy="36" r="6" fill="currentColor" opacity=".62" />
        <circle cx="41" cy="44" r="4" fill="currentColor" opacity=".46" />
    </svg>
);
