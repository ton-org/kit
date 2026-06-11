/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useLayoutEffect, useRef, useState } from 'react';

type ImageStatus = 'idle' | 'loading' | 'loaded' | 'error';

const toList = (src: string | string[] | undefined): string[] =>
    (Array.isArray(src) ? src : src ? [src] : []).filter((url): url is string => Boolean(url));

const useImageStatus = (src: string | undefined): ImageStatus => {
    const imageRef = useRef<HTMLImageElement | null>(null);

    const getImage = (): HTMLImageElement | null => {
        if (typeof window === 'undefined') return null;
        if (!imageRef.current) imageRef.current = new window.Image();
        return imageRef.current;
    };

    const resolve = (): ImageStatus => {
        const image = getImage();
        if (!image || !src) return 'idle';
        if (image.src !== src) image.src = src;
        return image.complete && image.naturalWidth > 0 ? 'loaded' : 'loading';
    };

    const [status, setStatus] = useState<ImageStatus>(resolve);

    useLayoutEffect(() => {
        setStatus(resolve());
        const image = getImage();
        if (!image) return;
        const onLoad = () => setStatus('loaded');
        const onError = () => setStatus('error');
        image.addEventListener('load', onLoad);
        image.addEventListener('error', onError);
        return () => {
            image.removeEventListener('load', onLoad);
            image.removeEventListener('error', onError);
        };
    }, [src]);

    return status;
};

interface FallbackImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
    /** One or more candidate URLs, tried in order until one loads. */
    src: string | string[] | undefined;
    /** Rendered while loading or when every candidate fails to load. */
    fallback?: React.ReactNode;
}

/**
 * `<img>` that walks a list of candidate URLs, showing the first that loads and
 * falling back to the next on error (404 / 403 / CSP / network). Renders
 * `fallback` until one succeeds.
 */
export const FallbackImage: React.FC<FallbackImageProps> = ({ src, fallback = null, alt = '', ...props }) => {
    const sources = toList(src);
    const key = sources.join(' ');

    const [index, setIndex] = useState(0);
    useLayoutEffect(() => setIndex(0), [key]);

    const current = sources[index];
    const status = useImageStatus(current);

    useLayoutEffect(() => {
        if (status === 'error' && index < sources.length - 1) {
            setIndex((value) => value + 1);
        }
    }, [status, index, sources.length]);

    if (status === 'loaded' && current) {
        return <img src={current} alt={alt} {...props} />;
    }
    return <>{fallback}</>;
};
