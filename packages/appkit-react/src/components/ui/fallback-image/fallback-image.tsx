/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef, ComponentRef, ReactNode } from 'react';

import { useResolvedImageSrc } from './use-resolved-image-src';

export interface FallbackImageProps extends Omit<ComponentPropsWithoutRef<'img'>, 'src'> {
    /** One or more candidate URLs, tried in order until one loads. */
    src: string | string[] | undefined;
    /** Rendered while loading or when every candidate fails to load. */
    fallback?: ReactNode;
}

/**
 * `<img>` that walks a list of candidate URLs, showing the first that loads and
 * falling back to the next on error. Renders `fallback` until one succeeds.
 */
export const FallbackImage = forwardRef<ComponentRef<'img'>, FallbackImageProps>(
    ({ src, fallback = null, alt = '', ...props }, ref) => {
        const { src: resolved, status } = useResolvedImageSrc(src);

        if (status === 'loaded' && resolved) {
            return <img ref={ref} src={resolved} alt={alt} {...props} />;
        }
        return <>{fallback}</>;
    },
);

FallbackImage.displayName = 'FallbackImage';
