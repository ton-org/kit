/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { getCardValueSvgProps } from './card-value-svg-props';
import type { CardValueSvgProps } from './card-value-svg-props';

export const StormDrakeValue = (props: CardValueSvgProps) => (
    <svg {...getCardValueSvgProps('Storm Drake', props)}>
        <title>Storm Drake</title>
        <path d="M76 19L43 87H75L63 141L119 65H84L96 19H76Z" fill="currentColor" opacity=".78" />
        <path
            d="M46 61C34 52 31 40 38 28C58 31 72 42 78 61"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth={8}
            opacity=".46"
        />
        <path
            d="M111 66C129 70 139 82 139 99C121 104 106 100 94 87"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth={8}
            opacity=".46"
        />
    </svg>
);
