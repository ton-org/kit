/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { SVGProps } from 'react';

export type CardValueSvgProps = SVGProps<SVGSVGElement>;

export const getCardValueSvgProps = (title: string, props: CardValueSvgProps): CardValueSvgProps => ({
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '0 0 160 160',
    fill: 'none',
    role: 'img',
    'aria-label': title,
    ...props,
});
