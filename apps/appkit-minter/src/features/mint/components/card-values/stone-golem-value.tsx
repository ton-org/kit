/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { getCardValueSvgProps } from './card-value-svg-props';
import type { CardValueSvgProps } from './card-value-svg-props';

export const StoneGolemValue = (props: CardValueSvgProps) => (
    <svg {...getCardValueSvgProps('Stone Golem', props)}>
        <title>Stone Golem</title>
        <rect x="48" y="26" width="64" height="34" rx="10" fill="currentColor" opacity=".82" />
        <rect x="33" y="68" width="94" height="42" rx="12" fill="currentColor" opacity=".64" />
        <rect x="45" y="117" width="70" height="24" rx="9" fill="currentColor" opacity=".5" />
        <path d="M61 44H73M87 44H99" stroke="currentColor" strokeLinecap="round" strokeWidth={6} opacity=".35" />
        <path d="M57 87H103" stroke="currentColor" strokeLinecap="round" strokeWidth={7} opacity=".28" />
    </svg>
);
