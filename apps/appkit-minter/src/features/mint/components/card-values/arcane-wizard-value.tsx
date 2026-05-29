/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { getCardValueSvgProps } from './card-value-svg-props';
import type { CardValueSvgProps } from './card-value-svg-props';

export const ArcaneWizardValue = (props: CardValueSvgProps) => (
    <svg {...getCardValueSvgProps('Arcane Wizard', props)}>
        <title>Arcane Wizard</title>
        <circle cx="80" cy="84" r="45" stroke="currentColor" strokeWidth={8} opacity=".78" />
        <path d="M80 32L125 111H35L80 32Z" stroke="currentColor" strokeLinejoin="round" strokeWidth={7} />
        <circle cx="80" cy="84" r="14" fill="currentColor" opacity=".52" />
        <path
            d="M80 17V31M29 84H43M117 84H131M47 47L57 57M103 57L113 47"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth={6}
            opacity=".54"
        />
    </svg>
);
